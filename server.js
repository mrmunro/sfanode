var express = require('express')
var customerDashboard = require('./routes/customer_dashboard.js')
var compress = require('compression')

var app = express()

//app.use(compress())

app.get('/customer_dashboard/report_sales_history/dummy.csv',customerDashboard.salesHistoryDummyCSV)
app.get('/customer_dashboard/report_sales_history/dummy.json',customerDashboard.salesHistoryDummy)
app.get('/customer_dashboard/report_sales_history',customerDashboard.salesHistory)


app.listen(9000)