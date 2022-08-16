var Sdk = window.Sdk || {};

(function () {
  this.retrieveBuildSiteCity = async function (executionContext) {
    // var permitName = formContext.getAttribute("contoso_Permit").getValue();
    // formContext._data._entity._attributes._collection.contoso_permit._attributeName
    var formContext = executionContext.getFormContext();
    let inspectionId = formContext._entityReference.id.guid;
    let inspectionEntity = formContext._entityReference.etn;
    //console.log([inspectionId, inspectionEntity]);
    Xrm.WebApi.retrieveRecord(
      inspectionEntity,
      inspectionId,
      "?$select=*&$expand=contoso_permit($select=contoso_BuildSite)"
    ).then(function (result) {
      console.log(
        "Retrieved values: Name: " +
          result.name +
          ", Primary Contact ID: " +
          result.primarycontactid.contactid +
          ", Primary Contact Name: " +
          result.primarycontactid.fullname
      );
    });
    //------------------------------------------------executionContext

    var Xrm = window.parent.Xrm;

    var accountId = Xrm.Page.data.entity
      .getId()
      .replace("{", "")
      .replace("}", "");
    console.log(accountId);

    let permit = Xrm.Page.getAttribute("contoso_permit").getValue();
    console.log(permit);

    await Xrm.WebApi.retrieveRecord("contoso_permit", permit[0].id).then(
      function permitSuccess(result) {
        buildSiteId = result._contoso_buildsite_value;
        Xrm.WebApi.retrieveRecord("contoso_buildsite", buildSiteId).then(
          function buildSiteSuccess(res) {
            buildSiteCity = res.contoso_city;
            console.log(buildSiteCity);
            Sdk.callCustomAPI(buildSiteCity);
          }
        );
      },
      /*
        console.log(result);
        console.log("_contoso_permit_value: " + result._contoso_permit_value);
        if (result._contoso_permit_value) {
          return retrievePermit(result._contoso_permit_value);
        }
      },
      */
      function (error) {
        alert("Error:" + error.message);
      }
    );

    // console.log(formContext);

    //ToDo: Get the ID of the current Inspection record - query for the permit id on the form
    //Use the ID of the related Permit to use Xrm.WebApi.Retrieve to retrieve the related Build Site.
    //Return the City value from the Build Site table
  };

  /**
   *
   * @param {*} permitId
   */
  function retrievePermit(permitId) {
    Xrm.WebApi.retrieveRecord("contoso_permit", permitId).then(
      function (result) {
        console.log(
          "_contoso_buildsite_value: " + result._contoso_buildsite_value
        );
        return retrieveBuildSite(result._contoso_buildsite_value);
      },

      function (error) {
        alert("Error:" + error.message);
      }
    );
  }

  /**
   *
   * @param {*} buildSiteId
   */
  function retrieveBuildSite(buildSiteId) {
    Xrm.WebApi.retrieveRecord("contoso_buildsite", buildSiteId).then(
      function (result) {
        // console.log("_contoso_buildsite_value: " + result._contoso_buildsite_value);
        console.log(result.contoso_city);
        return result.contoso_city;
      },

      function (error) {
        alert("Error:" + error.message);
      }
    );
  }

  this.callCustomAPI = function (buildSiteCity) {
    //ToDo: Get the Build Site City and give it to the Retrieve Lat Long Custom API
    //Parse the API response to retrieve Current Temperature, Humidity, Weather Icon, and Weather Description fields
    //Update HTML labels with appropriate values using document.getElementById("yourfieldname").text()

    // var buildSiteCity = this.retrieveBuildSiteCity();
    console.log(buildSiteCity);

    if (buildSiteCity != null && buildSiteCity != "") {
      //var formContext = executionContext.getFormContext();
      var parameters = { CityName: buildSiteCity };
      var customAPIName = "dit_RetrieveLatLongDetails";
      var serverURL = Xrm.Utility.getGlobalContext().getClientUrl();

      var req = new XMLHttpRequest();
      req.open("POST", serverURL + "/api/data/v9.2/" + customAPIName, true);
      req.setRequestHeader("Accept", "application/json");
      req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
      req.setRequestHeader("OData-MaxVersion", "4.0");
      req.setRequestHeader("OData-Version", "4.0");

      req.onreadystatechange = function () {
        if (this.readyState == 4 /*done*/) {
          req.onreadystatechange = null;

          if (this.status == 200 || this.status == 204) {
            var result = JSON.parse(this.response);
            // formContext.getAttribute("city").setValue(buildSiteCity);
            document.getElementById("city").value = String(buildSiteCity);
            // formContext.getAttribute("temp").setValue(result.Temperature);
            document.getElementById("temp").value = String(result.Temperature);
            // formContext.getAttribute("humidity").setValue(result.Humidity);
            document.getElementById("humidity").value = String(result.Humidity);
            // formContext.getAttribute("weather").setValue(result.WeatherDetails);
            document.getElementById("weather").value = String(
              result.WeatherDetails
            );
            // formContext.getAttribute("img").setValue(result.WeatherDetails);
            document.getElementById("img").src = String(result.WeatherIcons);
          } else {
            var error = JSON.parse(this.response).error;
            Xrm.Utility.alertDialog("Error occured: " + error.message);
          }
        }
      };

      req.send(JSON.stringify(parameters));
    }
  };
}.call(Sdk));
