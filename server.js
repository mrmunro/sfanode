var express = require('express')
var customerDashboard = require('./customerDashboard.js')
var prepopulate = require('./prepopulate.js')
var compress = require('compression')


var app = express()

//app.use(compress())

app.get('/customer_dashboard/report_sales_history',customerDashboard.salesHistory)
app.get('/customer_dashboard',customerDashboard.getDashboard)
app.get('/prepopulate', prepopulate.cache)


app.listen(9000)