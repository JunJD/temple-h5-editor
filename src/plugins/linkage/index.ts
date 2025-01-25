import type { Plugin } from 'grapesjs';

interface LinkagePluginConfig {
  // 可以添加插件配置选项
}

interface LinkageData {
  enabled: boolean;
  fieldValue: string;
  sourceType: 'fixed' | 'user-input';
  sourceValue?: string;
}

const LinkagePlugin: Plugin<LinkagePluginConfig> = (editor, opts = {}) => {
  // 在插件开始时添加检查
  console.log('Plugin initialized');
  console.log('TraitManager types:', editor.TraitManager.getTypes());


  // 确保 DataSource 已经准备好
  editor.on('load', () => {
    // 创建一个全局的DataSource来管理联动数据
    const linkageDataSource = editor.DataSources.add({
      id: 'linkage_data',
      records: []
    });

    console.log('=== linkageDataSource ===', linkageDataSource);
    // 监听 trait:value 事件
    editor.on('trait:value', ({ trait }) => {
      if (trait.getType() === 'linkage') {
        const value = trait.getValue();
        const component = trait.target;
        
        // 检查组件 ID
        const componentId = component.getId(); // 使用 getId() 而不是 get('id')
        if (!componentId) {
          console.error('Component ID is missing');
          return;
        }

        // 确保 DataSource 存在
        const dataSource = editor.DataSources.get('linkage_data');
        if (!dataSource) {
          console.error('DataSource not found');
          return;
        } else {
          console.log('=== dataSource ===', dataSource.getRecords());
        }

        console.log('=== Processing Component ===', {
          componentId,
          value,
          currentRecords: dataSource.getRecords()
        });

        if (value?.enabled) {
          // 创建记录数据
          const recordData = {
            id: componentId,  // 使用 getId() 获取的 ID
            attributes: {
              componentId: componentId,
              enabled: value.enabled,
              fieldValue: value.fieldValue,
              sourceType: value.sourceType,
              sourceValue: value.sourceValue
            }
          };

          const existingRecord = dataSource.getRecord(componentId);
          if (existingRecord) {
            existingRecord.set('attributes', recordData.attributes);
          } else {
            dataSource.addRecord(recordData);
          }

          console.log('=== After Update ===', {
            addedRecord: recordData,
            allRecords: dataSource.getRecords(),
            specificRecord: dataSource.getRecord(componentId)
          });
        } else {
          dataSource.removeRecord(componentId);
        }
      }
    });
  });

  // trait 类型定义
  editor.TraitManager.addType('linkage', {
    defaults: {
      name: 'linkage',
      label: '数据联动'
    }
  });

  // 监听组件添加事件
  editor.on('component:add', (component) => {
    if (!component.getTrait('linkage')) {
      component.addTrait({
        type: 'linkage',
        name: 'linkage',
      });
    }
  });

  // 修改 component:selected 事件处理
  editor.on('component:selected', (component) => {
    console.log('=== Component Selected ===');
    if (!component) {
      console.log('No component selected');
      return;
    }

    console.log('Selected component:', {
      id: component.get('id'),
      type: component.get('type'),
      traits: component.getTraits().map(t => ({
        name: t.get('name'),
        type: t.get('type')
      }))
    });

    // 检查 trait 类型是否注册
    const traitTypes = editor.TraitManager.getTypes();
    console.log('Available trait types:', Object.keys(traitTypes));
    console.log('Linkage trait type exists:', !!traitTypes.linkage);

    // 尝试获取 linkage trait
    const linkageTrait = component.getTrait('linkage');
    console.log('Linkage trait found:', !!linkageTrait);
  });

  // 添加命令
  // editor.Commands.add('get-linkage-data', {
  //   run(editor) {
  //     const dataSource = editor.DataSources.get('linkage_data');
  //     return dataSource.getRecords();
  //   }
  // });

  // editor.Commands.add('get-component-linkage', {
  //   run(editor, sender, options = {}) {
  //     const { componentId } = options;
  //     if (!componentId) return null;
      
  //     const dataSource = editor.DataSources.get('linkage_data');
  //     return dataSource.getRecord(componentId);
  //   }
  // });

  // editor.Commands.add('set-component-linkage', {
  //   run(editor, sender, options = {}) {
  //     const { componentId, enabled, fieldValue, sourceType, sourceValue } = options;
  //     if (!componentId) return false;

  //     const dataSource = editor.DataSources.get('linkage_data');
      
  //     if (enabled) {
  //       const recordData = {
  //         id: componentId,
  //         componentId,
  //         enabled,
  //         fieldValue,
  //         sourceType,
  //         sourceValue
  //       };

  //       try {
  //         dataSource.addRecord(recordData);
  //         return true;
  //       } catch (error) {
  //         console.error('Failed to set component linkage:', error);
  //         return false;
  //       }
  //     } else {
  //       try {
  //         dataSource.removeRecord(componentId);
  //         return true;
  //       } catch (error) {
  //         console.error('Failed to remove component linkage:', error);
  //         return false;
  //       }
  //     }
  //   }
  // });

  // editor.Commands.add('remove-component-linkage', {
  //   run(editor, sender, options = {}) {
  //     const { componentId } = options;
  //     if (!componentId) return false;

  //     const dataSource = editor.DataSources.get('linkage_data');
  //     dataSource.removeRecord(componentId);
  //     return true;
  //   }
  // });
};

export default LinkagePlugin;
