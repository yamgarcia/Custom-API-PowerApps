using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Threading.Tasks;

namespace DIT_RetrievalLatLongDetails
{
    public class RetrievalLatLongDetails : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {

            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            tracingService.Trace("Plugin Start: ReverseReverse");

            //Reference Plugin context
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));

            //InputParameters must match the name in your custom API
            string cityName = (string)context.InputParameters["CityName"];
            string apiEndpoint = string.Format("http://api.weatherstack.com/current?access_key=cb3bcd2f40b39efa3f3e895ef0e9c5cc&query={0}", cityName);

            WebClient webClient = new WebClient();
            string webClientResponse = webClient.DownloadString(apiEndpoint);

            DataContractJsonSerializer serializer = new DataContractJsonSerializer(typeof(Root));
            //https://docs.microsoft.com/en-us/dotnet/api/system.runtime.serialization.json.datacontractjsonserializer.readobject?view=net-6.0#system-runtime-serialization-json-datacontractjsonserializer-readobject(system-io-stream)
            //why using block?
            using (var stream = new MemoryStream(Encoding.Unicode.GetBytes(webClientResponse)))
            {
                Root parsedObject = (Root)serializer.ReadObject(stream);

                string latitude = parsedObject.location.lat;
                string longitude = parsedObject.location.lon;

                string weatherDetails = parsedObject.current.weather_descriptions[0];
                string weatherIcons = parsedObject.current.weather_icons[0];
                int temperature = (int)parsedObject.current.temperature;
                int humidity = (int)parsedObject.current.humidity;

                string localtime = parsedObject.location.localtime;


                context.OutputParameters["Latitude"] = latitude;
                context.OutputParameters["Longitude"] = longitude;

                context.OutputParameters["WeatherDetails"] = weatherDetails;
                context.OutputParameters["WeatherIcons"] = weatherIcons;
                context.OutputParameters["Temperature"] = temperature;
                context.OutputParameters["Humidity"] = humidity;

                context.OutputParameters["Localtime"] = localtime;
            }
        }
    }



    /*
     * using Microsoft.Xrm.Sdk;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;

    namespace ReverseReverse
    {
        public class ReverseReverse : IPlugin
        {
            public void Execute(IServiceProvider serviceProvider)
            {
                //Create Reference to Tracing Service
                ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
                tracingService.Trace("Plugin Start: ReverseReverse");

                //Reference Plugin context
                IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));

                //Get input from custom action 
                string inputString = (string)context.InputParameters["inputString"];
                tracingService.Trace("inputString is equal to: {0}", inputString);

                if (!string.IsNullOrEmpty(inputString))
                {
                    string reversedString = new string(inputString.Reverse().ToArray());
                    tracingService.Trace("inputString is equal to: {0}", reversedString);

                    context.OutputParameters["outputString"] = reversedString;
                }
            }
        }
    }

     * 
     */

    /*
     * using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Net;
    using System.Runtime.Serialization.Json;
    using System.Text;
    using System.Threading.Tasks;

    namespace TestConsole
    {
        internal class Program
        {
            static void Main(string[] args)
            {
                //string apiEndpoint = "http://api.weatherstack.com/current?access_key=cb3bcd2f40b39efa3f3e895ef0e9c5cc&query=NewYork";
                string apiEndpoint = "http://api.weatherstack.com/current?access_key=cb3bcd2f40b39efa3f3e895ef0e9c5cc&query=Vancouver";

                WebClient webClient = new WebClient();
                string webClientResponse = webClient.DownloadString(apiEndpoint);

                DataContractJsonSerializer serializer = new DataContractJsonSerializer(typeof(Root));

                //why using block?
                using (var stream = new MemoryStream(Encoding.Unicode.GetBytes(webClientResponse)))
                {
                    Root parsedObject = (Root)serializer.ReadObject(stream);

                    string latitude = parsedObject.location.lat;
                    string longitude = parsedObject.location.lon;
                }
            }
        }
     */

    // Root myDeserializedClass = JsonConvert.DeserializeObject<Root>(myJsonResponse);
    public class Current
    {
        public string observation_time { get; set; }
        public int temperature { get; set; }
        public int weather_code { get; set; }
        public List<string> weather_icons { get; set; }
        public List<string> weather_descriptions { get; set; }
        public int wind_speed { get; set; }
        public int wind_degree { get; set; }
        public string wind_dir { get; set; }
        public int pressure { get; set; }
        public double precip { get; set; }
        public int humidity { get; set; }
        public int cloudcover { get; set; }
        public int feelslike { get; set; }
        public int uv_index { get; set; }
        public int visibility { get; set; }
        public string is_day { get; set; }
    }

    public class Location
    {
        public string name { get; set; }
        public string country { get; set; }
        public string region { get; set; }
        public string lat { get; set; }
        public string lon { get; set; }
        public string timezone_id { get; set; }
        public string localtime { get; set; }
        public int localtime_epoch { get; set; }
        public string utc_offset { get; set; }
    }

    public class Request
    {
        public string type { get; set; }
        public string query { get; set; }
        public string language { get; set; }
        public string unit { get; set; }
    }

    public class Root
    {
        public Request request { get; set; }
        public Location location { get; set; }
        public Current current { get; set; }
    }
}