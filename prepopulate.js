module.exports = {
	cache : prepopulateCache
}


function prepopulateCache(req,res){
	console.log('Prepopulation starting...')
	
	var populationStatus = {'status': 'populated'}
	
	res.end(JSON.stringify(populationStatus))
}