import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { autocompletion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface ExpressionEditorProps {
    value: string;
    onChange: (value: string) => void;
    fields: Array<{ name: string; label: string; defaultValue?: any }>;
}

// 常用数学函数和运算符
const MATH_COMPLETIONS = [
    { label: '+', type: 'operator', detail: '加法' },
    { label: '-', type: 'operator', detail: '减法' },
    { label: '*', type: 'operator', detail: '乘法' },
    { label: '/', type: 'operator', detail: '除法' },
    { label: 'Math.round', type: 'function', detail: '四舍五入', info: '(num)' },
    { label: 'Math.floor', type: 'function', detail: '向下取整', info: '(num)' },
    { label: 'Math.ceil', type: 'function', detail: '向上取整', info: '(num)' },
    { label: 'Math.abs', type: 'function', detail: '绝对值', info: '(num)' },
    { label: 'Math.min', type: 'function', detail: '最小值', info: '(...nums)' },
    { label: 'Math.max', type: 'function', detail: '最大值', info: '(...nums)' }
];

function getFieldCompletions(fields: Array<{ name: string; label: string }>, from: number) {
    return {
        from,
        options: fields.map(field => ({
            label: field.name,
            type: 'variable',
            detail: field.label,
            boost: 1,
            info: `字段类型: ${field.name.includes('amount') ? '数字' : '文本'}`
        })),
        validFor: /^\w*$/
    };
}

function getFormCompletion(from: number) {
    return {
        from,
        options: [{
            label: 'form',
            type: 'keyword',
            boost: 99,
            detail: '表单对象',
            info: '包含所有表单字段的值',
            apply: (view: any, completion: any, from: number, to: number) => {
                view.dispatch({
                    changes: { from, to, insert: 'form.' },
                    selection: { anchor: from + 5 }
                });
            }
        }],
        validFor: /^fo?r?m?$/
    };
}

function getMathCompletions(from: number) {
    return {
        from,
        options: MATH_COMPLETIONS,
        validFor: /^[A-Za-z+\-*/.]*$/
    };
}

function myCompletions(fields: Array<{ name: string; label: string }>) {
    return (context: CompletionContext): CompletionResult | null => {
        const tree = syntaxTree(context.state);
        const nodeBefore = tree.resolveInner(context.pos, -1);

        // 如果在注释或字符串中，不提供补全
        if (nodeBefore.type.name.includes('Comment') || 
            nodeBefore.type.name.includes('String')) {
            return null;
        }

        // 获取光标前的文本
        const textBefore = context.matchBefore(/[\w.+\-*/]*/) || 
            { from: context.pos, to: context.pos, text: '' };
        
        if (textBefore.text === '') {
            return getMathCompletions(textBefore.from);
        }

        // 如果是 form. 后面的内容
        if (textBefore.text.match(/^form\./)) {
            return getFieldCompletions(fields, textBefore.from + 5);
        }

        // 如果正在输入 form
        if ('form'.startsWith(textBefore.text.toLowerCase())) {
            return getFormCompletion(textBefore.from);
        }

        // 提供数学函数和运算符补全
        return getMathCompletions(textBefore.from);
    };
}

const EXPRESSION_EXAMPLES = [
    { label: '基础计算', expr: 'form.price * form.quantity', description: '计算两个字段的乘积' },
    { label: '四舍五入', expr: 'Math.round(form.price * form.quantity)', description: '将计算结果四舍五入为整数' },
    { label: '保留两位小数', expr: '(form.price * form.quantity).toFixed(2)', description: '保留两位小数的金额计算' },
    { label: '最小值限制', expr: 'Math.max(form.price * form.quantity, 0)', description: '确保计算结果不小于0' }
];

export function ExpressionEditor({ value, onChange, fields }: ExpressionEditorProps) {
    const [error, setError] = React.useState<string | null>(null);
    const [preview, setPreview] = React.useState<string | null>(null);

    // 验证并预览表达式
    const validateAndPreview = React.useCallback((expr: string) => {
        if (!expr) {
            setError(null);
            setPreview(null);
            return;
        }

        try {
            // 创建模拟的 form 对象，优先使用字段的默认值
            const form = fields.reduce((acc, field) => {
                if (field.defaultValue !== undefined) {
                    // 使用字段的默认值
                    acc[field.name] = field.defaultValue;
                } else {
                    acc[field.name] = 1;
                }
                return acc;
            }, {} as Record<string, any>);

            // 尝试执行表达式
            const exprFn = new Function('form', `return ${expr}`);
            const resultValue = exprFn(form);
            setError(null);
            setPreview(`使用${Object.entries(form).map(([key, value]) => 
                `${key}=${value}`).join(', ')}计算得到：${resultValue}`);
        } catch (error) {
            setError(error instanceof SyntaxError ? '语法错误：表达式格式不正确' : '表达式无效');
            setPreview(null);
        }
    }, [fields]);

    // 当表达式改变时进行验证
    React.useEffect(() => {
        validateAndPreview(value);
    }, [value, validateAndPreview]);

    const extensions = React.useMemo(() => [
        javascript(),
        autocompletion({
            override: [myCompletions(fields)],
            defaultKeymap: true,
            maxRenderedOptions: 50,
            activateOnTyping: true,
            icons: false,
            addToOptions: [
                {
                    render: (completion) => {
                        const element = document.createElement('div');
                        element.className = 'flex flex-col gap-1 px-2 py-1.5';
                        element.innerHTML = `
                            <div class="flex items-center justify-between gap-2">
                                <span class="font-medium">${completion.label}</span>
                                ${completion.detail ? `<span class="text-xs opacity-50">${completion.detail}</span>` : ''}
                            </div>
                            ${completion.info ? `<div class="text-xs opacity-40">${completion.info}</div>` : ''}
                        `;
                        return element;
                    },
                    position: 20
                }
            ]
        })
    ], [fields]);

    return (
        <div className="space-y-2">
            <div className="relative">
                <CodeMirror
                    value={value}
                    height="100px"
                    theme="dark"
                    extensions={extensions}
                    onChange={onChange}
                    placeholder="输入表达式，例如: form.price * form.quantity"
                    basicSetup={{
                        lineNumbers: false,
                        foldGutter: false,
                        dropCursor: false,
                        allowMultipleSelections: false,
                        indentOnInput: false,
                        highlightActiveLine: false,
                        highlightSelectionMatches: false,
                    }}
                    className={error ? 'border-destructive' : ''}
                />
                <div className="absolute bottom-1 right-2 text-xs opacity-40">
                    提示：输入 form. 查看可用字段，输入 Math. 查看数学函数
                </div>
            </div>
            {error && (
                <div className="text-xs text-destructive">
                    {error}
                </div>
            )}
            {preview && !error && (
                <div className="text-xs text-muted-foreground">
                    预览结果：{preview}
                </div>
            )}
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            插入示例表达式 <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[300px]">
                        {EXPRESSION_EXAMPLES.map(example => (
                            <DropdownMenuItem
                                key={example.label}
                                onClick={() => onChange(example.expr)}
                                className="flex flex-col items-start py-2"
                            >
                                <div className="font-medium">{example.label}</div>
                                <div className="text-xs text-muted-foreground mt-1">{example.description}</div>
                                <code className="text-xs bg-accent/50 px-1 py-0.5 rounded mt-1">{example.expr}</code>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
} 