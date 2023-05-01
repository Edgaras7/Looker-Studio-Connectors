var cc = DataStudioApp.createCommunityConnector();
 
// [START get_config]
// https://developers.google.com/datastudio/connector/reference#getconfig
function getConfig(request) {

  var config = cc.getConfig();

  config.newTextInput()
  .setId('apiKeyInput')
  .setName('API Key:')
  .setHelpText('cryptocompare.com API key')
  .setPlaceholder('YOUR-API-KEY');

  config.newTextInput()
  .setId('dayLimit')
  .setName('Show number of days')
  .setHelpText('Number of days to get historical BTC data')
  .setPlaceholder('10');

  config
      .newSelectSingle()
      .setId('currencyInput')
      .setName('Select primary currency') 
      .setAllowOverride(false)
      .addOption(config.newOptionBuilder().setLabel('EUR').setValue('EUR'))
      .addOption(config.newOptionBuilder().setLabel('USD').setValue('USD'));


  
   
  return config.build();
};
// [END get_config]

// [START get_schema]
function getFields() {
 
}

var Schema = [
  {
    name: 'time',
    label: 'TIME (UNIX)',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'high',
    label: 'Price (High)',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: true
    }
  },
  {
    name: 'low',
    label: 'Price (Low)',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: true
    }
  },
  {
    name: 'open',
    label: 'Price (Open)',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: true
    }
  },
  {
    name: 'close',
    label: 'Price (Close)',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: true
    }
  },  
  {
    name: 'volumefrom',
    label: 'Volume from',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: true
    }
  },
  {
    name: 'volumeto',
    label: 'Volume to',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: true
    }
  },
  {
    name: 'conversionType',
    label: 'Conversion Type',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'conversionSymbol',
    label: 'Conversion Symbol',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  }
];

// https://developers.google.com/datastudio/connector/reference#getschema
function getSchema(request) {
  return {schema: Schema};
};
// [END get_schema]

// [START get_data]
// https://developers.google.com/datastudio/connector/reference#getdata
function getData(request) {
  var apiKey = request.configParams.apiKeyInput;
  var dayLimit = parseInt(request.configParams.dayLimit); 
  var currencyInput = parseInt(request.configParams.currencyInput);

  var url = "https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym="+currencyInput+"&limit="+dayLimit+"&api_key="+apiKey;
  var response = UrlFetchApp.fetch(url);
  var json = response.getContentText();
  var data = JSON.parse(json).Data.Data;

  var dataSchema = [];
  request.fields.forEach(function(field) {
    for (var i = 0; i < Schema.length; i++) {
      if (Schema[i].name === field.name) {
        dataSchema.push(Schema[i]);
        break;
      }
    }
  });

var rows = [];
  data.forEach(function(item) {
    var row = [];
    request.fields.forEach(function(field) {
      switch (field.name) {
        case 'time':
          row.push(item.time);
          break;
        case 'high':
          row.push(item.high);
          break;
        case 'low':
          row.push(item.low);
          break;
        case 'open':
          row.push(item.open);
          break;
        case 'close':
          row.push(item.close);
          break;
        case 'volumefrom':
          row.push(item.volumefrom);
          break;
        case 'volumeto':
          row.push(item.volumeto);
          break;
        case 'conversionType':
          row.push(item.conversionType);
          break;
        case 'conversionSymbol':
          row.push(item.conversionSymbol);
          break;
        default:
          row.push('');
      }
    });
    rows.push({values: row});
  });
  return {
    schema: dataSchema,
    rows: rows
  };
};
  
// [END get_data]

// https://developers.google.com/datastudio/connector/reference#isadminuser
function isAdminUser() {
  return false;
}