class Document {
    attrs = ['delivered_at', 'delivered_number', 'secret_label',
    'reg_number', 'reg_date', 'origin', 'doc_type', 'doc_content',
    'sheets_count', 'instance_number', 'executant', 'execute_till',
    'executed_at', 'execute_label', 'stored_in']

    delivered_at = '' // Дата поступления, Date
    delivered_number = '' // Номер входящий, string
    secret_label = '' // Гриф, string
    
    reg_number = '' // Регистрационный номер входящего, string
    reg_date = '' // Дата регистрации входящего, Date
    origin = '' // Откуда поступил, string
    doc_type = '' // Вид документа, string
    doc_content = '' // Краткое содержание документа, string
    sheets_count = 0 // Количество листов, int
    instance_number = '' // Номера экземпляров, string
    executant = '' // Назначенный исполнитель, string
    execute_till = '' // Установленный срок исполнения, Date
    executed_at = '' // Дата исполнения, Date
    execute_label = '' // Отметка об исполнении, String
    stored_in = '' // Место хранения документа, String

    constructor() {
        let sql_attrs = []
        this.attrs.forEach((attr) => {
            sql_attrs.push(attr + ' TEXT')
        })
        
        const sqlite3 = require('sqlite3').verbose()
        this.db = new sqlite3.Database('./documents.sqlite3');
        this.db.run(`CREATE TABLE IF NOT EXISTS documents(\
                    id INTEGER PRIMARY KEY,\
                    ${sql_attrs.join(', ')})`);
    }

    fill(data) {
        let sql_attrs = []
        this.attrs.forEach((attr) => {
            this[attr] = data[attr]
            sql_attrs.push(attr + ' TEXT')
        })
                

        return this
    }

    insert() {
        let attr_values = []
        let attr_placeholders = []
        this.attrs.forEach((attr) => {
            attr_values.push(this[attr])
            attr_placeholders.push('?')
        })
        this.db.run(`INSERT INTO documents(${this.attrs.join(',')}) \
                     VALUES (${attr_placeholders.join(',')})`, 
                     attr_values)
    }

    all() {
        let result
        this.db.all('SELECT * FROM documents', (err, rows) => { result = rows } )
        return result
    }
}

module.exports = { Document }