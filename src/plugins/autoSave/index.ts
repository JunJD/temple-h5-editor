import type { Plugin } from 'grapesjs';
import { updateIssue } from '@/actions/builder';

interface AutoSaveOptions {
  // 两次保存之间的最小间隔时间（毫秒）
  debounceTime?: number;
  // 保存前的回调函数
  beforeSave?: () => void;
  // 保存后的回调函数
  afterSave?: (result: any) => void;
  // 保存失败的回调函数
  onError?: (error: any) => void;
  // 当前页面的ID
  pageId?: string;
  // 是否显示自动保存的提示
  showToast?: boolean;
}

/**
 * 自动保存插件
 * 监听编辑器内容变更事件，自动触发保存操作
 */
const autoSavePlugin: Plugin<AutoSaveOptions> = (editor, opts = {}) => {
  const options = {
    debounceTime: 500, // 默认500毫秒防抖时间
    beforeSave: () => {}, 
    afterSave: () => {},
    onError: (error: any) => console.error('自动保存失败:', error),
    pageId: '',
    showToast: true, // 默认显示提示
    ...opts
  };

  let saveTimeout: ReturnType<typeof setTimeout> | null = null;
  let isSaving = false;

  // 防抖函数，避免频繁保存
  const debounceSave = async () => {
    // 如果已经在保存中，则不重复触发
    if (isSaving) return;

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(async () => {
      try {
        // 设置保存状态
        isSaving = true;
        
        // 触发保存前事件
        editor.trigger('autoSave:before');
        
        // 执行保存前回调
        options.beforeSave();
        
        // 获取页面内容（在编辑器销毁/切换期间做安全检查）
        const hasGetHtml = typeof (editor as any)?.getHtml === 'function';
        const hasGetCss = typeof (editor as any)?.getCss === 'function';
        const wrapper = (editor as any)?.getWrapper?.() || (editor as any)?.DomComponents?.getWrapper?.();

        if (!hasGetHtml || !hasGetCss || !wrapper) {
          // 编辑器尚未就绪或已被销毁，跳过本次自动保存
          isSaving = false;
          return;
        }

        const html = (editor as any).getHtml() ?? '';
        const css = (editor as any).getCss() ?? '';
        const projectData = (editor as any).getProjectData?.() ?? {};

        // 检查内容是否为空
        if(!html || !css) {
          console.warn('自动保存失败: 页面内容不能为空');
          
          // 触发保存错误事件
          editor.trigger('autoSave:error', '页面内容不能为空');
          
          isSaving = false;
          return;
        }

        // 检查是否提供了页面ID
        if(!options.pageId) {
          console.warn('自动保存失败: 未提供页面ID');
          
          // 触发保存错误事件
          editor.trigger('autoSave:error', '未提供页面ID');
          
          isSaving = false;
          return;
        }
        
        // 调用与builder-header.tsx中相同的保存接口
        const result = await updateIssue(options.pageId, { html, css, projectData });
        
        // 执行保存成功回调
        options.afterSave(result);
        
        // 触发保存成功事件，并传递showToast标志，以便头部组件可以根据此决定是否显示通知
        editor.trigger('autoSave:after', { result, showToast: options.showToast });
        
        console.log('自动保存成功');
      } catch (error) {
        // 执行保存失败回调
        options.onError(error);
        
        // 触发保存错误事件
        editor.trigger('autoSave:error', error);
        
        console.error('自动保存失败:', error);
      } finally {
        // 重置保存状态
        isSaving = false;
        // 如果编辑器被销毁，清理定时器
        if (!(editor as any)?.getWrapper) {
          if (saveTimeout) clearTimeout(saveTimeout);
        }
      }
    }, options.debounceTime);
  };

  // 监听编辑器内容变更事件
  const componentEvents = [
    'component:add',
    'component:remove',
    'component:update',
    'component:update:classes',
    'component:update:attributes',
    'component:update:styles',
    'component:update:content',
  ];

  // 样式相关事件
  const styleEvents = [
    'style:update',
    'style:property:update',
    'style:sector:update',
    'style:target',
  ];

  // 块相关事件
  const blockEvents = [
    'block:drag:stop',
    'block:add',
    'block:remove',
    'block:update',
  ];

  // 画布相关事件
  const canvasEvents = [
    'canvas:drop',
  ];

  // Trait 相关事件
  const traitEvents = [
    'trait:value',
    'trait:update',
  ];

  // 选择器相关事件
  const selectorEvents = [
    'selector:add',
    'selector:remove',
    'selector:update',
    'selector:state',
  ];

  // 页面相关事件
  const pageEvents = [
    'page:update',
    'page:add',
    'page:remove',
  ];

  // 合并所有事件
  const allEvents = [
    ...componentEvents,
    ...styleEvents,
    ...blockEvents,
    ...canvasEvents,
    ...traitEvents,
    ...selectorEvents,
    ...pageEvents,
  ];

  // 注册所有事件监听器
  allEvents.forEach(event => {
    editor.on(event, debounceSave);
  });

  // 添加一个手动保存命令
  editor.Commands.add('auto-save', {
    run() {
      debounceSave();
    }
  });

  // 编辑器销毁时，清理定时器，避免在销毁后触发保存
  editor.on('destroy', () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
  });

  // 显示初始化消息
  console.log('自动保存插件已初始化，将在内容变更后自动保存');
};

export default autoSavePlugin;
