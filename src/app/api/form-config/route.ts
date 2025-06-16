import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        // 从URL中获取issueId
        const { searchParams } = new URL(request.url);
        const issueId = searchParams.get('issueId');

        if (!issueId) {
            return NextResponse.json(
                { error: 'Issue ID is required' },
                { status: 400 }
            );
        }

        // 从数据库获取issue
        const issue = await prisma.issue.findUnique({
            where: { id: issueId }
        });

        if (!issue) {
            return NextResponse.json(
                { error: 'Issue not found' },
                { status: 404 }
            );
        }

        // 从issue中提取表单配置
        const formConfig = issue.formConfig as any;
        
        if (!formConfig) {
            return NextResponse.json(
                { error: 'Form config not found' },
                { status: 404 }
            );
        }
        
        // 从issue数据中尝试获取保存的表单数据
        let formData: Record<string, any> = {};
        let columns: Array<{label: string, value: string, required: boolean}> = [];
        
        // 首先检查issue.content中是否有组件数据
        const content = issue.content as any;
        if (content && typeof content === 'object') {
            // 检查content中是否直接包含components
            if (Array.isArray(content.components)) {
                // 查找form组件
                const formComponent = findFormComponent(content.components);
                
                if (formComponent) {
                    // 从组件中提取formData和columns
                    formData = formComponent.formData || {};
                    columns = formComponent.columns || [];
                    
                    console.log('从content.components获取到的表单数据:', { formData, columns });
                }
            }
            
            // 如果没有找到数据，尝试检查content中的projectData
            if (Object.keys(formData).length === 0 && content.projectData) {
                // 尝试从projectData中提取组件数据
                if (content.projectData.components) {
                    const formComponent = findFormComponent(content.projectData.components);
                    
                    if (formComponent) {
                        // 从组件中提取formData和columns
                        formData = formComponent.formData || {};
                        columns = formComponent.columns || [];
                        
                        console.log('从content.projectData获取到的表单数据:', { formData, columns });
                    }
                }
            }

            // 如果还没有找到数据，检查projectData.pages
            if (Object.keys(formData).length === 0 && 
                content.projectData && 
                content.projectData.pages) {
                
                // GrapesJS有时会将组件存储在pages中
                const pages = content.projectData.pages;
                
                // 遍历pages
                for (const page of pages) {
                    if (page.frames && Array.isArray(page.frames)) {
                        // 遍历frames
                        for (const frame of page.frames) {
                            if (frame.component && frame.component.components) {
                                // 在frame的组件中查找form
                                const formComponent = findFormComponent(frame.component.components);
                                
                                if (formComponent) {
                                    // 从组件中提取formData和columns
                                    formData = formComponent.formData || {};
                                    columns = formComponent.columns || [];
                                    
                                    console.log('从pages中获取到的表单数据:', { formData, columns });
                                    break;
                                }
                            }
                        }
                        
                        // 如果已找到数据，跳出循环
                        if (Object.keys(formData).length > 0) {
                            break;
                        }
                    }
                }
            }
        }
        
        // 如果没有找到数据，则根据formConfig生成
        if (Object.keys(formData).length === 0) {
            formData = generateFormData(formConfig);
        }
        
        if (columns.length === 0) {
            columns = generateColumns(formConfig);
        }

        // 构建响应数据
        const responseData = {
            formConfig,
            formData,
            columns
        };

        return NextResponse.json(responseData, { status: 200 });
    } catch (error) {
        console.error('Form config fetch failed:', error instanceof Error ? error.message : String(error));
        return NextResponse.json(
            { error: 'Failed to fetch form config' },
            { status: 500 }
        );
    }
}

/**
 * 从组件树中查找表单组件
 */
function findFormComponent(components: any[]): any {
    if (!Array.isArray(components)) {
        return null;
    }
    
    // 遍历组件树
    for (const component of components) {
        // 如果是表单组件
        if (component.type === 'form') {
            return component;
        }
        
        // 递归查找子组件
        if (component.components) {
            const found = findFormComponent(component.components);
            if (found) {
                return found;
            }
        }
    }
    
    return null;
}

/**
 * 根据表单配置生成初始formData
 */
function generateFormData(formConfig: any) {
    const formData: Record<string, any> = {};
    
    // 添加字段初始值
    if (Array.isArray(formConfig.fields)) {
        formConfig.fields.forEach((field: any) => {
            formData[field.name] = field.defaultValue || '';
        });
    }
    
    return formData;
}

/**
 * 根据表单配置生成columns数组
 */
function generateColumns(formConfig: any) {
    const columns: Array<{label: string, value: string, required: boolean}> = [];

                 
    formConfig.goodsOptions?.level1.forEach(item => {
        columns.push({
            label: item.label,
            value: item.value as string,
            required: false
        });
    })
    Object.values(formConfig.goodsOptions?.level2 || {}).forEach((item: any) => {
        item.forEach((item: any) => {
            columns.push({
                label: item.label,
                value: item.value as string,
                required: false
            });
        })
    })
    
    // 添加其他字段
    if (Array.isArray(formConfig.fields)) {
        formConfig.fields.forEach((field: any) => {
            columns.push({
                label: field.label,
                value: field.name,
                required: field.required ?? false
            });
        });
    }
    
    return columns;
} 