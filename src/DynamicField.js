/**
 * Компонент для списка объектов на форме ввода данных посредством динамического набора полей
 * Основан на компоненте {@link Ext.form.FieldContainer}.
 *
 * ## Пример использования
 *
 *  var form = Ext.create('Ext.form.Panel', {
 *      viewModel: {
 *          data: {
 *              rowCount: 0,
 *              dynamicData: [
 *                  {
 *                      user_id: 34,
 *                      username: 'Петя'
 *                  },
 *                  {
 *                      user_id: 67,
 *                      user_is_del: true,
 *                      username: 'Васян'
 *                  }
 *              ]
 *          }
 *      },
 *      items: [
 *          {
 *              xtype: 'ux-dynamic-field',
 *              idProperty: 'user_id',
 *              isDelProperty: 'user_is_del',
 *              name: 'users',
 *              fieldLabel: 'Наименование поля',
 *              columns: [
 *                  {xtype: 'textfield', name: 'username', flex: 1},
 *                  {xtype: 'container', items: [
 *                      {xtype: 'datefield', flex: null, width: 120},
 *                      {xtype: 'numberfield', flex: null, width: 90}
 *                  ]}
 *              ],
 *              bind: {
 *                  value: '{dynamicData}'
 *                  rowVisibleCount: '{rowCount}'
 *              }
 *          }
 *      ]
 *  });
 *
 *
 * @class App.ux.field.DynamicField
 */

Ext.define('App.ux.field.DynamicField', {

    extend: 'Ext.form.FieldContainer',

    alias: 'widget.ux-dynamic-field',

    requiers: [
        'Ext.container.Container',
        'Ext.layout.HBox',
        'Ext.form.field.Hidden',
        'Ext.Button'
    ],

    items: [],

    /**
     * Указываем какой атрибут будем передавать во ViewModel
     * @property publishes
     */
    publishes: {
        rowVisibleCount: 0,
        value: null
    },

    /**
     * Указываем дефолтный атрибут для передачи во ViewModel
     * Вместо
     * bind: {
     *     value: '{someAttr}'
     * }
     * Можно указать
     * bind: '{someAttr}'
     * @type {String}
     * @property defaultBindProperty
     */
    defaultBindProperty: 'value',

    /**
     * Необхдимо для метода {@link Ext.form.Panel#getValues} чтобы дать понять форме, что текущий компонент - поле
     * @property isField
     * @type {Boolean}
     */
    isField: true,

    /**
     * Флаг указывающий, что компонент {@link Ext.form.FieldContainer} является полем
     * @property isFormField
     * @type {Boolean}
     * @private
     */
    isFormField: true,

    /**
     * Проверка на валидность поля. Пока оставим в true
     * @todo В перспективе реализовать проверку на валидность
     * @property isValid
     * @return {Boolean}
     */
    isValid: function () {
        return true;
    },

    /**
     * Возвращает значение поля, которое будет включено в используемую модель {@link Ext.data.Model}
     * Подробнее тут: {@link Ext.form.field.Field#getModelData}
     * @return {Object}
     */
    getModelData: function () {
        return {
            [this.getFieldIdentifier()]: this.getValue()
        };
    },

    /**
     * Возвращает значение поля, которое будет включено в стандартную форму submit
     * Подробнее тут: {@link Ext.form.field.Field#getSubmitData}
     * @return {Object}
     */
    getSubmitData: function () {
        return {
            [this.getName()]: this.getValue()
        };
    },

    /**
     * Если компонент является редактором, то вместо атрибута name, у него должен быть атрибут dataIndex
     * @return {String}
     */
    getFieldIdentifier: function () {
        return this.isEditorComponent ? this.dataIndex : this.name;
    },

    isDirty: Ext.emptyFn,

    config: {

        /**
         * @cfg {Integer} fieldMargin
         * Внешние отступы элементов строки
         */
        fieldMargin: 3,

        /**
         * @cfg {String} name
         * Имя поля, используемое на форме.
         * По умолчанию имеет вид 'ux-dynamic-field-ext-XXX'
         */
        name: 'ux-dynamic-field-' + Ext.id(null),

        /**
         * @cfg {Array} value
         * Текущее значение компонента содержит массив объектов, каждый из которых соответствует своей строке
         */
        value: null,

        /**
         * @cfg {Array} columns
         * Конфигурация элементов форм в отдельной строке
         */
        columns: [],

        /**
         * @cfg {Integer} responsiveWidth
         * Минимальная ширина в пикселях для вертикального перестроения элементов строки
         */
        responsiveWidth: 400,

        /**
         * @cfg {Boolean} rowHboxVertical
         * Флаг вертикального расположения элементов строки
         * Необходим для создания новых строк
         */
        rowHboxVertical: false,

        /**
         * @cfg {Number} rowAddCount
         * Счетчик добавленных строк
         */
        rowAddCount: 0,

        /**
         * @cfg {Number} rowVisibleCount
         * Счетчик видимых строк полей
         */
        rowVisibleCount: 0,

        /**
         * @cfg {Number} maxRowCount
         * Максимальное количество строк полей
         */
        maxRowCount: 10,

        /**
         * @cfg {String} idProperty
         * Наименование ключевого поля
         */
        idProperty: 'id',

        /**
         * @cfg {String} isDelProperty
         * Наименование поля логического удаления
         */
        isDelProperty: 'is_del',

        /**
         * @cfg {Object} rowConfig
         * Конфигурация строки
         */
        rowConfig: {
            layout: {
                type: 'hbox',
                align: 'stretch',
                pack: 'start'
            },
            defaults: {
                flex: 1
            },
            items: [],
            viewModel: {
                data: {
                    row: null
                }
            }
        },

        /**
         * @cfg {Object} delBtnConfig
         * Конфигурация кнопки удаления
         */
        delBtnConfig: {
            xtype: 'button',
            reference: 'uxDynamicFieldRemoveBtn',
            tooltip: 'Удалить текущую строку',
            disabled: false,
            flex: null,
            iconCls: 'x-fa fa-minus',
            handler: 'removeRowHandler'
        },

        /**
         * @cfg {Object} addBtnConfig
         * Конфигурация кнопки добавления
         */
        addBtnConfig: {
            xtype: 'button',
            reference: 'uxDynamicFieldAddBtn',
            tooltip: 'Добавить новую строку',
            flex: null,
            hideMode: 'offsets',
            disabled: false,
            iconCls: 'x-fa fa-plus',
            handler: 'addRowHandler'
        }
    },

    controller: {
        control: {
            '#': {
                /**
                 * Изменение параметра rowHboxVertical при изменении ширины компонента
                 * Этот параметр влияет на атрибут vertical лэйаута контейнера строки
                 * @param {App.ux.field.DynamicField} me основной компонент
                 * @param {Integer} nWidth новая ширина компонента
                 * @param {Integer} nHeight новая высота компонента
                 * @param {Integer} oWidth старая ширина компонента
                 */
                resize: function (me, nWidth, nHeight, oWidth) {
                    if ((nWidth !== oWidth || oWidth === undefined) && me.getRowHboxVertical() !== (me.getResponsiveWidth() > nWidth)) {
                        me.setRowHboxVertical(me.getResponsiveWidth() > nWidth);
                        Ext.suspendLayouts();
                        Ext.Array.each(me.items.getRange(), function (row) {
                            row.getLayout().setVertical(me.getRowHboxVertical());
                        });
                        Ext.resumeLayouts();
                        me.updateLayout();
                    }
                }
            },
            'container[reference="uxDynamicFieldRow"]': {

                /**
                 * После добавления строки скрываем кнопку добавления в предыдущей строке
                 * При достижении максимального количества строк, блокируем кнопку добавления
                 */
                afterrender: function (row) {
                    row.getLayout().setVertical(this.getView().getRowHboxVertical());
                    this.updateRowVisibleCount();
                    this.updateControlButtons();
                },

                /**
                 * После удаления строки актуализируем видимость кнопок добавления / удаления
                 */
                removed: function () {
                    this.updateRowVisibleCount();
                    this.updateControlButtons();
                },

                /**
                 * После скрытия строки актуализируем видимость кнопок добавления / удаления
                 */
                hide: function () {
                    this.updateRowVisibleCount();
                    this.updateControlButtons();
                },

                /**
                 * После показа строки актуализируем видимость кнопок добавления / удаления
                 */
                show: function () {
                    this.updateRowVisibleCount();
                    this.updateControlButtons();
                }
            },
            'container[reference="uxDynamicFieldRow"] component': {
                afterrender: function (fld) {
                    (fld.isXType('field') || fld.isXType('segmentedbutton')) && fld.on({
                        change: {
                            single: false,
                            scope: this.getView(),
                            /**
                             * Метод для модификации текущего значения
                             * @param {Ext.form.field.Base} cmp
                             * @param {String|Number|Object} newVal
                             */
                            fn: function (cmp, newVal) {
                                if (!Ext.isArray(this.getValue()) || !this.getValue().length) {
                                    this.setValue(
                                        [Ext.apply({ [cmp.name]: newVal }, this.getDefaultValue(true))]
                                    );
                                } else {
                                    this.applyValues();
                                }
                            }
                        }
                    })
                }
            },
            'container[reference="uxDynamicFieldRow"] button': {
                afterrender: function (fld) {
                    fld.on({
                        toggle: {
                            single: false,
                            scope: this.getView(),
                            /**
                             * Метод для модификации текущего значения
                             * @param {Ext.form.field.Base} cmp
                             * @param {String|Number|Object} newVal
                             */
                            fn: function (cmp, newVal) {
                                if (!Ext.isArray(this.getValue()) || !this.getValue().length) {
                                    this.setValue(
                                        [Ext.apply({ [cmp.name]: newVal }, this.getDefaultValue(true))]
                                    );
                                } else {
                                    this.applyValues();
                                }
                            }
                        }
                    })
                }
            }
        },

        /**
         * Добавление новой строки по нажатию на кнопку добавления
         */
        addRowHandler: function () {
            let me = this.getView(),
                val = me.getValue();
            me.setValue(
                ((!Ext.isArray(val) || !val.length) ? [me.getDefaultValue()] : val)
                    .concat(me.getDefaultValue(true))
            );
        },

        /**
         * Удаление строки по нажатию на кнопку удаления
         * @param {Ext.Button} btn
         */
        removeRowHandler: function (btn) {
            let me = this.getView(),
                row = btn.lookupViewModel().getView();
            me.removeRow(row);
            // me.applyValues();
        },

        /**
         * Подсчет количества видимых строк
         */
        updateRowVisibleCount: function () {
            let me = this.getView();
            me.rendered && me.setRowVisibleCount(
                Ext.ComponentQuery.query('container[reference="uxDynamicFieldRow"]:visible', me).length
            );
        },

        /**
         * Актуализация видимости и доступности кнопок управления
         * Если осталась одна строка, кнопка удаления заблокирована
         * Если строка не последняя, то кнопка добавления скрывается
         * Если количество строк больше или равно лимиту, то кнопка добавления заблокирована
         */
        updateControlButtons: function () {
            let me = this.getView();
            if (me.rendered) {
                Ext.ComponentQuery.query(
                    'container[reference="uxDynamicFieldRow"]:visible button[reference="uxDynamicFieldRemoveBtn"]',
                    me)
                    .forEach(function (btn, index, res) {
                        btn.setDisabled(res.length === 1);
                    });
                Ext.ComponentQuery.query(
                    'container[reference="uxDynamicFieldRow"]:visible button[reference="uxDynamicFieldAddBtn"]',
                    me)
                    .forEach(function (btn, index, res) {
                        let isLast = index + 1 === res.length;
                        btn.toggleCls('x-ui-transparent', !isLast);
                        btn.setDisabled(!isLast || res.length >= me.getMaxRowCount());
                    });
            }
        }
    },

    /**
     * Инициализация компонента
     * Добавление кнопок упоавления строками
     * Вызов обработчика полей и генератора строк
     * @protected
     */
    initComponent: function () {
        this.callParent(arguments);

        this.setColumns(
            (this.getColumns() || []).concat({
                xtype: 'container',
                flex: null,
                items: [
                    this.getDelBtnConfig(),
                    this.getAddBtnConfig()
                ]
            })
        );

        this.reconfigColumns(this.getColumns());
        this.generateRows();
    },

    /**
     * Добавление строки
     * Это приватный метод, он просто вставляет контейнер и не изменяет атрибут value
     * @param {Object} data Данные для строки
     * @private
     */
    addRow: function (data) {
        let me = this,
            row;

        row = me.add(Ext.create('Ext.container.Container', Ext.apply(me.getRowConfig(), {
            reference: 'uxDynamicFieldRow',
            hidden: data && data[me.getIsDelProperty()],
            items: me.getColumns()
        })));

        row.getViewModel().set('row', Ext.applyIf(data ? Ext.clone(data) : {}, me.getDefaultValue()));
    },

    /**
     * Добавление строки
     * @param {Object} data
     */
    insertRow: function (data) {
        this.setValue(
            (this.getValue() || []).concat(Ext.clone(data) || {})
        );
    },

    /**
     * Удаление строки
     * В качестве параметра можно передать строку объект {@link Ext.container.Container}
     * или ее индекс
     * @param {Integer|Ext.container.Container} target
     */
    removeRow: function (target) {
        let vm, data, index;

        if (Ext.isNumber(target)) {
            target = this.items.getAt(target);
        }

        if (target instanceof Ext.container.Container && target.getReference() === 'uxDynamicFieldRow') {
            vm = target.getViewModel();
            data = vm.get('row');
            if (data.phantom && !!~(index = this.items.indexOfKey(target.getId()))) {
                let value = Ext.clone(this.getValue());
                (value || []).splice(index, 1);
                this.setValue(value);
            } else {
                data[this.getIsDelProperty()] = true;
                this.applyValues();
                target.hide();
            }
        }
    },

    /**
    * Устанавливает назначаемое значение и вызывает генератор строк
    * @param {Array} value
    * @return {Array}
    */
    setValue: function (value) {
        let isGen = JSON.stringify(this.value) !== JSON.stringify(value);
        this.callParent([value]);
        this.rendered && isGen && this.generateRows();
        return value;
    },

    privates: {
        /**
         * Актуализация значения компонента
         */
        applyValues: function () {
            let res = [];
            this.items.each(function (row) {
                res.push(Ext.clone(row.getViewModel().get('row')));
            }, this);
            this.setValue(res);
        },

        /**
         * Возвращает декрементированное значение счетчика
         * @return {number}
         */
        getRowAddCount: function () {
            return --this.rowAddCount;
        },

        /**
         * Взвращает дефолтное значение для новой фантомной строки
         * @private
         * @param {Boolean} phantom Установка флага phantom для новой записи
         * @return {Object}
         */
        getDefaultValue: function (phantom) {
            return phantom ? {
                phantom: true,
                [this.getIdProperty()]: this.getRowAddCount(),
                [this.getIsDelProperty()]: false
            } : {};
        },

        /**
         * Обработчик полей
         * Обходит рекурсивно атрибут this.getColumns()
         *
         * Для всех контейнеров назначает layout = hbox
         *
         * Для всех элементов отнаследованных от field
         * Убирает флаг isFormField,
         * Добавляет отступ margin = this.getFieldMargin()
         * Биндит поле на ViewModel строки по имени поля
         *
         * Для всех элементов отнаследованных от button
         * Добавляет отступ margin = this.getFieldMargin()
         * @param {Array|Object} cmp
         */
        reconfigColumns: function (cmp) {

            if (Ext.isArray(cmp)) {

                Ext.Array.each(cmp, function (item) {
                    this.reconfigColumns(item);
                }, this);

            } else if (Ext.isObject(cmp) && !(cmp instanceof Ext.Component)) {
                cmp['_tmp'] = Ext.create(cmp);

                if (cmp['_tmp'].isXType('container') && !cmp['_tmp'].isXType('segmentedbutton')) {
                    cmp.layout = { type: 'hbox' };
                    cmp.margin = 0;
                    if (cmp.items) {
                        this.reconfigColumns(cmp.items);
                    }
                } else if (cmp['_tmp'].isXType('field') || cmp['_tmp'].isXType('segmentedbutton')) {
                    Ext.apply(cmp, {
                        isFormField: false,
                        margin: this.getFieldMargin()
                    });

                    if (cmp.name) {
                        cmp.bind = Ext.apply(cmp.bind || {}, {
                            value: Ext.String.format('{row.{0}}', cmp.name)
                        });
                    }
                } else if (cmp['_tmp'].isXType('button')) {
                    if (cmp['_tmp'].enableToggle && cmp.name) {
                        cmp.bind = Ext.apply(cmp.bind || {}, {
                            pressed: Ext.String.format('{row.{0}}', cmp.name)
                        });
                    }
                    cmp.margin = this.getFieldMargin();
                }
                cmp['_tmp'].destroy(true);
                cmp['_tmp'] = undefined;
            }
        },

        /**
         * Генератор строк
         * При наличии значения value
         * @private
         */
        generateRows: function () {

            Ext.suspendLayouts();

            for (let i = 0, row, l = Ext.Array.max([this.items.getCount(), (Ext.isArray(this.value) ? this.value : []).length]); i < l; i++) {
                // Идем по максимально длинному списку строк или значений
                // Пытаемся найти строку
                row = this.items.getAt(i);

                if (row && (this.value || [])[i]) {

                    // Если строка найдена и ей соотв. значение, то обновляем ViewModel строки
                    row.getViewModel().set('row', Ext.clone(this.value[i]));

                    // Если у значения атрибут удаления = true, то скрываем строку
                    row.setHidden(this.value[i][this.getIsDelProperty()] === true);

                } else if (!row && (this.value || [])[i]) {

                    // Если строки нет, а значение есть, то создаем строку
                    // Если у значения атрибут удаления = true, то она скроется внутри метода addRow
                    this.addRow((this.value || [])[i]);

                } else if (row && !(this.value || [])[i]) {

                    // Если строка найдена, а значение нет, то удаляем строку и уменьшаем счетчик
                    row.destroy(true);
                    --i;

                }
            }

            // Если ни одно поле не сгенерировалось, добавляем одно
            // Но не через установку значения, иначе при значени null оно сразу же изменится
            if (!this.items.getCount()) {
                this.addRow(null);
            }

            Ext.resumeLayouts();
        }
    }
});