class Document {

    static attrs = ['delivered_at', 'delivered_number', 'secret_label',
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

    fill(data) {
        data.forEach((attr) => {
            this[attr[0]] = attr[1]
        })
        return this
    }

    static dbFriendlyDate(date) {
        return date.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1')
    }

    static filterAttr(val) {
        return (/(\d{2})\.(\d{2})\.(\d{4})/.test(val)) ? this.dbFriendlyDate(val) : val
    }

    static db() {
        const db = require('better-sqlite3')('documents.sqlite3');
        db.prepare(`CREATE TABLE IF NOT EXISTS documents(
                        id INTEGER PRIMARY KEY AUTOINCREMENT, 
                        ${Document.attrs.map(attr => `${attr} TEXT`).join(',')}
                    )`).run()
        return db
    }

    create() {
        const attrs = Document.attrs.join(',')
        const placeholders = Document.attrs.map((_attr) => '?').join(',')
        const values = Document.attrs.map((attr) => this[attr])
        const sql = `INSERT INTO documents (${attrs}) VALUES (${placeholders})`
        Document.db().prepare(sql).run(values)
    }

    update(id) {
        const attrs = Document.attrs.map((attr) => `${attr} = ?`)
        const values = Document.attrs.map((attr) => this[attr])
        const sql = `UPDATE documents SET ${attrs} WHERE id = ${id}`
        Document.db().prepare(sql).run(values)
    }

    static all() {
        const sql = 'SELECT * FROM documents ORDER BY id'
        return Document.db(sql).prepare(sql).all()
    }

    static state(document) {
        const execute_till = +new Date(document.execute_till)
        const executed_at = +new Date(document.executed_at)
        const today = Date.now()
        let state = 'default'
      
        if ((execute_till && execute_till < today) && !executed_at) {
            state = 'expired'
        } else if ((execute_till  && (execute_till - (60*60*24*7*1000)) < today) && !executed_at) {
            state = 'pending' 
        } else if ((execute_till && execute_till >= today) && !executed_at) {
            state = 'executing'
        } else if (executed_at && executed_at <= today) {
            state = 'executed'
        }
        
        return state
    }

    static delete(id) {
        const sql = 'DELETE FROM documents WHERE id = ?'
        Document.db().prepare(sql).run(id)
    }

    static find(id) {
        const sql = 'SELECT * FROM documents WHERE id = ?'
        return Document.db().prepare(sql).all(id)[0]
    }

}

module.exports = { Document }