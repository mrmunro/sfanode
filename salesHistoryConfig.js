
var apigee = require('apigee-access')
var fs = require('fs')
var Async = require('async')

module.exports = {

	setupSalesHistory : setupSalesHistory
}

var salesHistoryTargetOperation = function(client,request,response,cache,parameters,callback) {
    
    client.SI_APIGEE_BI_SALES_HIST_DET_I(parameters.inbound, function(err,result) {
        if(err) {
            console.log(err);
            fs.writeFileSync("err.log", err.body);
            callback(err);
        }
        
        console.log(result.RESPONSE.TERR.SALES_DETAIL.UOM);
        console.log(request.headers);
        
        
        
        
        //csv conversion here
        if(request.headers["content-type"]=="text/csv") {
            console.log('csv requested');
            parameters.json2csv({ data: result.RESPONSE.TERR.SALES_DETAIL, fields: parameters.fields, fieldNames: parameters.targetFields, quotes: '', defaultValue: '' }, function(err, csv) {
            if (err) console.log(err);
            
            var res = csv.replace(/{}/g, "")
            console.log(res);
            cache.put(parameters.territoryKey,res,600);
            parameters.outbound.SALES_DATA.push(res);
            
            });
            
            
        }
        else{
            parameters.outbound.SALES_DATA.push(result);
        }
        
        console.log("==============================================");
        callback(); 
    })
}

function setupSalesHistory(req) {
    var fields = ['CUST', 'SUBB', 'SGRP','SOFF', 'MATL','BRAND','QTY','UOM','SUBB_DSC','MAT_DSC','QTYYTD','QTYYTD','QTYPYTD','QTYDIFF','QTYPY','QTYBTS','ISYTD','ISPYTD','ISDIFF','ISPY','ISBTS','CALDAY','GLBNSALESLC','LOCCUR']
    var targetFields = ['CUST', 'SUBB', 'SGRP','SOFF', 'MATL','BRAND','QTY','UOM','SUBB_DSC','MAT_DSC','QTYYTD','QTYYTD','QTYPYTD','QTYDIFF','QTYPY','QTYBTS','ISYTD','ISPYTD','ISDIFF','ISPY','ISBTS','CALDAY','GLBNSALESLC','LOCCUR']
    var defaultServicePath = '/XISOAPAdapter/MessageServlet?senderParty=&senderService=BS_APIGEE&receiverParty=&receiverService=&interface=SI_APIGEE_BI_SALES_HIST_DET_I&interfaceNamespace=APIGEE_BI_SALES_HISTORY_DETAIL'
    
    var salesHistoryFields = apigee.getVariable(req,'salesHistoryFields');
    var salesHistoryFieldsTarget = apigee.getVariable(req,'salesHistoryFieldsTarget');
    
    if(salesHistoryFields) {
      console.log(salesHistoryFields)    
      fields = salesHistoryFields.split(',')  
    }
    
    if(salesHistoryFieldsTarget) {
      console.log('target: ' + salesHistoryFieldsTarget)
      targetFields = salesHistoryFieldsTarget.split(',')  
    }
	
    var pathToService = apigee.getVariable(req,'salesHistoryServiceURL');
    if(!pathToService){
      pathToService = defaultServicePath
    }
    
    
    
    var parameters = {
        'wsdl': 'SI_APIGEE_BI_SALES_HIST_DET_I.wsdl',
        'servicePath': pathToService,
        'fields': fields,
        'targetFields': targetFields,
        'cache': {'name': 'SFA2_SalesHistoryCache2', 'resource' : 'SFA2_SalesCacheHistory','scope': 'global',
          'defaultTtl': 30},
        'cacheKeyPrefix': 'salesHistory',
        'clientOperation': salesHistoryTargetOperation 
    }
    
    return parameters
}