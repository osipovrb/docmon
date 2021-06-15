const nl2br = require('nl2br');

class DocumentTableRow {

    static secretLabels = {
        'dsp':  'ДСП',
        's':    'Секретно',
        'ss':   'Совершенно секретно',
        'ov':   'Особой важности'
    }

    static noData = '<i>нет данных</i>'

    constructor(document) { 
        this.document = document 
    }

    static formatDate(date) {
        if (!date) {
            return null
        }
        return (new Date(date)).toLocaleDateString()
    }

    id() { 
        return this.document.id
    }

    delivered() {
        return `Дата: ${DocumentTableRow.formatDate(this.document.delivered_at) || DocumentTableRow.noData}<br/>
                Номер: ${this.document.delivered_number || DocumentTableRow.noData}<br/>
                Гриф: ${DocumentTableRow.secretLabels[this.document.secret_label]}`
    }

    reg() {
        return `Дата: ${DocumentTableRow.formatDate(this.document.reg_date) || DocumentTableRow.noData}<br/>
                Номер: ${this.document.reg_date || DocumentTableRow.noData}`
    }

    origin() {
        return this.document.origin || DocumentTableRow.noData
    }

    content() {

        return `Вид: ${this.document.doc_type || DocumentTableRow.noData}<br/>
                Краткое содержание: ${nl2br(this.document.doc_content) || DocumentTableRow.noData}`
    }

    sheets() {
        return `Листов: ${this.document.sheets_count || DocumentTableRow.noData}<br/>
                № экз.: ${this.document.instance_number || DocumentTableRow.noData}`
    }

    executant() {
        return nl2br(this.document.executant) || DocumentTableRow.noData
    }

    execute_till() {
        return DocumentTableRow.formatDate(this.document.execute_till) || DocumentTableRow.noData
    }

    execute_label() {
        return nl2br(this.document.execute_label) || DocumentTableRow.noData
    }

    executed_at() {
        return DocumentTableRow.formatDate(this.document.executed_at) || DocumentTableRow.noData
    }

    stored_in() {
        return this.document.stored_in || DocumentTableRow.noData
    }

    row() {
        return [
            this.id(),
            this.delivered(),
            this.reg(),
            this.origin(),
            this.content(),
            this.sheets(),
            this.execute_till(),
            this.executant(),
            this.executed_at(),
            this.execute_label(),
            this.stored_in()
        ]
    }

}

module.exports = { DocumentTableRow }