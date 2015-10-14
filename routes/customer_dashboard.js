var express = require('express')
var sfa_reports = require('../sfa/sfa_reports.js')


function salesHistoryDummyCSV(req,res){
	sfa_reports.getSalesHistoryDummyCSV(req,res)
}

function salesHistoryDummy(req,res){
	sfa_reports.getSalesHistoryDummy(req,res)
}

function salesHistory(req,res){
	sfa_reports.getSalesHistory(req,res)
}

module.exports = {
    salesHistoryDummyCSV : salesHistoryDummyCSV,
	salesHistoryDummy : salesHistoryDummy,
	salesHistory : salesHistory
}