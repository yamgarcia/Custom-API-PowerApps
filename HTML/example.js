function onChange(executionContext) {
  var floor = formContext.getControl("floorlogicalName").getValue();
  //get house lookup from floor
  Xrm.WebApi.retrieveRecord(
    "floorentitylogicalName",
    floor.id,
    "?$select=housefieldlogicalName"
  ).then(
    function success(result) {
      var houselookup = result.entities[0]["houselookuplogicalname"];
    },
    function (error) {
      console.log(error.message);
      // handle error conditions
    }
  );
}

function getAllFloors(houselookupid) {
  var fetchXMl =
    "<fetch mapping='logical'>" +
    "<entity name='floorentitylogicalname'>" +
    "<attribute name='floorentitylogicalnameid'/>" +
    "<attribute name='name'/>" +
    "<filter type='and'>" +
    "<condition attribute='houselookupid' operator='eq' value='" +
    houselookupid +
    "' />" +
    "</filter>" +
    "</entity>" +
    "</fetch>";
  var flooridList = [];
  Xrm.WebApi.retrieveMultipleRecords(
    "floorentitylogicalname",
    "?fetchXml=" + fetchXMl
  ).then(
    function success(result) {
      for (var i = 0; i < result.entities.length; i++) {
        flooridList.push(result.entities[i]["floorentitylogicalnameid"]);
      }
      getAllRooms(flooridList);
      // perform additional operations on retrieved records
    },
    function (error) {
      console.log(error.message);
      // handle error conditions
    }
  );
}

function getAllRooms(flooridList) {
  let filterCondition = "";

  for (let index = 0; index < flooridList.length; index++) {
    filterCondition += "<value>" + array[index] + "</value>";
  }

  let fetchXMl =
    "<fetch mapping='logical'>" +
    "<entity name='roomentitylogicalname'>" +
    "<attribute name='roomentitylogicalnameid'/>" +
    "<attribute name='name'/>" +
    "<filter type='and'>" +
    "<condition attribute='floorid' operator='in' />" +
    filterCondition +
    "</condition>" +
    "</filter>" +
    "</entity>" +
    "</fetch>";

  Xrm.WebApi.retrieveMultipleRecords(
    "roomentitylogicalname",
    "?fetchXml=" + fetchXml
  ).then(
    function success(result) {
      for (var i = 0; i < result.entities.length; i++) {
        console.log(result.entities[i]);
      }
      // perform additional operations on retrieved records
    },
    function (error) {
      console.log(error.message);
      // handle error conditions
    }
  );
}
