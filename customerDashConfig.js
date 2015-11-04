var apigee = require('apigee-access')
var fs = require('fs')

module.exports = {

	setupDashboard : setupDashboard
}

var custDashboardTargetOperation = function(client,request,response,parameters,callback) {
    
    client.SI_APIGEE_BI_CUSTOMER_DASHBOARD_I(parameters.inbound, function(err,result) {
        if(err) {
            console.log(err);
            fs.writeFileSync("err.log", err.body);
            callback(err);
        }
        
        //console.log(result.RESPONSE.TERR[0].DASHB);
        
        console.log(request.headers);
        
        //csv conversion here
        if(request.headers["content-type"]=="text/csv") {
            console.log('csv requested');
            parameters.json2csv({ data: result.RESPONSE.TERR[0].DASHB, fields: parameters.fields, fieldNames: parameters.targetFields }, function(err, csv) {
            if (err) console.log(err);
            
            console.log(csv);
            parameters.cache.put(parameters.territoryKey,csv,600);
            parameters.outbound.SALES_DATA.push(csv);
            
            });
            
            
        }
        else{
            parameters.outbound.SALES_DATA.push(result);
        }
        
        console.log("==============================================");
        callback(); 
    })
}

function setupDashboard(req) {
    var fields = ['RECTY', 'CUST', 'SGRP','SOFF','BRND','BRNDDSC', 'MATL','ACTCUSTST','POTCUSTST','PRCLVL','ISYTD','ISBDG','NETINVLC1','GSPERC','GSPOT','OPNPOT','ISBTS','JANCYIS','FEBCYIS','MARCYIS','APRCYIS','MAYCYIS','JUNCYIS','JULCYIS','AUGCYIS','SEPCYIS','OCTCYIS','NOVCYIS','DECCYIS','JANPYIS','FEBPYIS','MARPYIS','APRPYIS','MAYPYIS','JUNPYIS','JULPYIS','AUGPYIS','SEPPYIS','OCTPYIS','NOVPYIS','DECPYIS','QTYYTD', 'LASTORD','QTY','UOM']
    var targetFields = ['RECTY', 'CUST', 'SGRP','SOFF','BRND','BRNDDSC', 'MATL','ACTCUSTST','POTCUSTST','PRCLVL','ISYTD','ISBDG','NETINVLC1','GSPERC','GSPOT','OPNPOT','ISBTS','JANCYIS','FEBCYIS','MARCYIS','APRCYIS','MAYCYIS','JUNCYIS','JULCYIS','AUGCYIS','SEPCYIS','OCTCYIS','NOVCYIS','DECCYIS','JANPYIS','FEBPYIS','MARPYIS','APRPYIS','MAYPYIS','JUNPYIS','JULPYIS','AUGPYIS','SEPPYIS','OCTPYIS','NOVPYIS','DECPYIS','QTYYTD', 'LASTORD','QTY','UOM']
    var defaultServicePath = '/XISOAPAdapter/MessageServlet?senderParty=&senderService=BS_APIGEE&receiverParty=&receiverService=&interface=SI_APIGEE_BI_CUSTOMER_DASHBOARD_I&interfaceNamespace=APIGEE_BI_CUSTOMER_DASHBOARD'
    
    var customerDashboardFields = apigee.getVariable(req,'customerDashboardFields');
    var customerDashboardFieldsTarget = apigee.getVariable(req,'customerDashboardFieldsTarget');
    
    if(customerDashboardFields) {
      console.log(customerDashboardFields)    
      fields = customerDashboardFields.split(',')  
    }
    
    if(customerDashboardFieldsTarget) {
      console.log('target: ' + customerDashboardFieldsTarget)
      targetFields = customerDashboardFieldsTarget.split(',')  
    }
	
    var pathToService = apigee.getVariable(req,'customerDashboardServiceURL');
    if(!pathToService){
      pathToService = defaultServicePath
    }
    
    var cache = apigee.getCache('SFA2_CustomerDashboardCache',{
          resource: 'SFA2_CustomerDashboardHistory',
          scope: 'global',
          defaultTtl: 30
        });
    
    var parameters = {
        'wsdl': 'SI_APIGEE_BI_CUSTOMER_DASHBOARD_I.wsdl',
        'servicePath': pathToService,
        'fields': fields,
        'targetFields': targetFields,
        'cache': cache,
        'cacheKeyPrefix': 'customerDashboard',
        'clientOperation': custDashboardTargetOperation 
    }
    
    return parameters
}