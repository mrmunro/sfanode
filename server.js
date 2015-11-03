var express = require('express')
var customerDashboard = require('./customerDashboard.js')
var compress = require('compression')


var app = express()

//app.use(compress())

app.get('/customer_dashboard/report_sales_history',customerDashboard.salesHistory)


app.listen(9000)