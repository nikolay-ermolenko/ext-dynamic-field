# Компонент DynamicField для ExtJS

Компонент для списка объектов на форме ввода данных посредством динамического набора полей
Основан на компоненте [Ext.form.FieldContainer](https://docs.sencha.com/extjs/6.7.0/classic/Ext.form.FieldContainer.html) .

### Пример использования

```js
var form = Ext.create('Ext.form.Panel', {
  viewModel: {
    data: {
      rowCount: 0,
      dynamicData: [
        {
          user_id: 34,
          username: 'Петя'
        },
        {
          user_id: 67,
          user_is_del: true,
          username: 'Васян'
        }
      ]
    }
  },
  items: {
    xtype: 'ux-dynamic-field',
    idProperty: 'user_id',
    isDelProperty: 'user_is_del',
    name: 'users',
    fieldLabel: 'Наименование поля',
    columns: [
      {xtype: 'textfield', name: 'username', flex: 1},
      {
        xtype: 'container', 
        items: [
          {xtype: 'datefield', flex: null, width: 120},
          {xtype: 'numberfield', flex: null, width: 90}
        ]
      }
    ],
    bind: {
      value: '{dynamicData}'
      rowVisibleCount: '{rowCount}'
    }
  }
});
```
