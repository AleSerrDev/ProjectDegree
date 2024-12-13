namespace elGalloWebapi.App.Services;
using System;
using System.Xml;
using CsvHelper;
using System.Globalization;
using Newtonsoft.Json;
using System.IO;
using System.Collections.Generic;
using CsvHelper.Configuration;
using Newtonsoft.Json.Linq;

public class GeoJsonService
{
    public static string ConvertToGeoJson(string input)
    {
        if (IsGeoJson(input))
        {
            return input;
        }
        else if (IsKml(input))
        {
            return ConvertKmlToGeoJson(input);
        }
        else if (IsXml(input))
        {
            return ConvertXmlToGeoJson(input);
        }
        else if (IsCsv(input))
        {
            return ConvertCsvToGeoJson(input);
        }
        else
        {
            throw new InvalidOperationException("Input format not supported.");
        }
    }
   
    private static string ConvertKmlToGeoJson(string kml)
    {
      
        XmlDocument xmlDoc = new XmlDocument();
        xmlDoc.LoadXml(kml);
        var geoJson = new JObject { ["type"] = "FeatureCollection", ["features"] = new JArray() };
        var placemarks = xmlDoc.GetElementsByTagName("Placemark");

        foreach (XmlNode placemark in placemarks)
        {
            var feature = new JObject { ["type"] = "Feature", ["geometry"] = new JObject(), ["properties"] = new JObject() };
            var nameNode = placemark["name"];
            if (nameNode != null)
            {
                feature["properties"]["name"] = nameNode.InnerText;
            }

            var pointNode = placemark["Point"];
            if (pointNode != null)
            {
                var coordinates = pointNode["coordinates"].InnerText.Split(',');
                feature["geometry"] = new JObject
                {
                    ["type"] = "Point",
                    ["coordinates"] = new JArray(double.Parse(coordinates[0]), double.Parse(coordinates[1]))
                };
            }

            var polygonNode = placemark["Polygon"];
            if (polygonNode != null)
            {
                var coordinates = new JArray();
                var coordNodes = polygonNode.GetElementsByTagName("coordinates");
                foreach (XmlNode coordNode in coordNodes)
                {
                    var coordPairs = coordNode.InnerText.Trim().Split(' ');
                    foreach (var pair in coordPairs)
                    {
                        var coords = pair.Split(',');
                        coordinates.Add(new JArray(double.Parse(coords[0]), double.Parse(coords[1])));
                    }
                }
                feature["geometry"] = new JObject
                {
                    ["type"] = "Polygon",
                    ["coordinates"] = new JArray(coordinates)
                };
            }

            ((JArray)geoJson["features"]).Add(feature);
        }

        return geoJson.ToString();
    }

    private static string ConvertXmlToGeoJson(string xml)
    {
        // Implement logic to convert XML to GeoJSON
        XmlDocument xmlDoc = new XmlDocument();
        xmlDoc.LoadXml(xml);
        var geoJson = new JObject { ["type"] = "FeatureCollection", ["features"] = new JArray() };
        var items = xmlDoc.GetElementsByTagName("item");

        foreach (XmlNode item in items)
        {
            var feature = new JObject { ["type"] = "Feature", ["geometry"] = new JObject(), ["properties"] = new JObject() };
            foreach (XmlNode child in item.ChildNodes)
            {
                feature["properties"][child.Name] = child.InnerText;
            }

            if (item["latitude"] != null && item["longitude"] != null)
            {
                feature["geometry"] = new JObject
                {
                    ["type"] = "Point",
                    ["coordinates"] = new JArray(double.Parse(item["longitude"].InnerText), double.Parse(item["latitude"].InnerText))
                };
            }

            ((JArray)geoJson["features"]).Add(feature);
        }

        return geoJson.ToString();
    }

    private static string ConvertCsvToGeoJson(string csv)
    {
        var geoJson = new JObject { ["type"] = "FeatureCollection", ["features"] = new JArray() };
        using (var reader = new StringReader(csv))
        using (var csvReader = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture) { HasHeaderRecord = true }))
        {
            var records = csvReader.GetRecords<dynamic>();
            foreach (var record in records)
            {
                var feature = new JObject { ["type"] = "Feature", ["geometry"] = new JObject(), ["properties"] = new JObject() };
                foreach (var property in record)
                {
                    string key = property.Key;
                    string value = property.Value;
                    feature["properties"][key] = value;
                }

                if (record.latitude != null && record.longitude != null)
                {
                    feature["geometry"] = new JObject
                    {
                        ["type"] = "Point",
                        ["coordinates"] = new JArray(double.Parse(record.longitude), double.Parse(record.latitude))
                    };
                }

                ((JArray)geoJson["features"]).Add(feature);
            }
        }

        return geoJson.ToString();
    }
    

    
    
    //sssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
    
    public static string Convert(string geoJson, string heather) 
    {
        if (string.IsNullOrWhiteSpace(geoJson))
        {
            throw new ArgumentException("GeoJSON cannot be null or empty.", nameof(geoJson));
        }

        if (string.IsNullOrWhiteSpace(heather))
        {
            throw new ArgumentException("Header cannot be null or empty.", nameof(heather));
        }

        switch (heather.ToLowerInvariant())
        {
            case "application/json":
                return geoJson;
            case "application/xml":
                return ConvertGeoJsonToXml(geoJson);
            case "text/csv":
                return ConvertGeoJsonToCsv(geoJson);
            case "application/vnd.google-earth.kml+xml":
                return ConvertGeoJsonToKml(geoJson);
            default:
                throw new InvalidOperationException("Unsupported format. Valid formats are 'xml', 'csv', and 'kml'.");
        } 
    }

private static bool IsGeoJson(string input)
{
    try
    {
        var obj = JsonConvert.DeserializeObject<dynamic>(input);
        return obj.type != null && obj.type == "FeatureCollection";
    }
    catch
    {
        return false;
    }
}

private static bool IsKml(string input)
{
    return input.Contains("<kml");
}

private static bool IsXml(string input)
{
    try
    {
        var xmlDoc = new XmlDocument();
        xmlDoc.LoadXml(input);
        return true;
    }
    catch
    {
        return false;
    }
}

private static bool IsCsv(string input)
{
    return input.Contains(",") && input.Contains("\n");
}

private static string SanitizePropertyName(string propertyName)
{
    // Reemplaza los corchetes y otros caracteres no permitidos
    return propertyName.Replace("[", "_").Replace("]", "_");
}

private static string ConvertGeoJsonToXml(string geoJson)
{
    var geoJsonObject = JObject.Parse(geoJson);
    var xmlDoc = new XmlDocument();
    var root = xmlDoc.CreateElement("root");
    xmlDoc.AppendChild(root);

    foreach (var feature in geoJsonObject["features"])
    {
        var item = xmlDoc.CreateElement("item");

        foreach (var property in feature["properties"])
        {
            // Sanitiza el nombre de la propiedad
            var sanitizedPropertyName = SanitizePropertyName(property.Path);
            var child = xmlDoc.CreateElement(sanitizedPropertyName);
            child.InnerText = property.First.ToString();
            item.AppendChild(child);
        }

        if (feature["geometry"]?["coordinates"] != null)
        {
            var lat = xmlDoc.CreateElement("latitude");
            var lon = xmlDoc.CreateElement("longitude");
            lat.InnerText = feature["geometry"]["coordinates"][1]?.ToString();
            lon.InnerText = feature["geometry"]["coordinates"][0]?.ToString();
            item.AppendChild(lat);
            item.AppendChild(lon);
        }

        root.AppendChild(item);
    }

    using var stringWriter = new StringWriter();
    using var xmlTextWriter = new XmlTextWriter(stringWriter) { Formatting = System.Xml.Formatting.Indented };
    xmlDoc.WriteTo(xmlTextWriter);
    return stringWriter.ToString();
}

private static string ConvertGeoJsonToCsv(string geoJson)
{
    var geoJsonObject = JObject.Parse(geoJson);
    using var writer = new StringWriter();
    using var csv = new CsvWriter(writer, new CsvConfiguration(CultureInfo.InvariantCulture) { });

    var features = geoJsonObject["features"];
    var records = new List<Dictionary<string, string>>();

    foreach (var feature in features)
    {
        var record = new Dictionary<string, string>();

        foreach (var property in feature["properties"])
        {
            record[property.Path] = property.First?.ToString() ?? string.Empty;
        }

        if (feature["geometry"]?["coordinates"] != null)
        {
            record["latitude"] = feature["geometry"]["coordinates"][1]?.ToString() ?? string.Empty;
            record["longitude"] = feature["geometry"]["coordinates"][0]?.ToString() ?? string.Empty;
        }

        records.Add(record);
    }

    csv.WriteRecords(records);
    return writer.ToString();
}


private static string ConvertGeoJsonToKml(string geoJson)
{
    var geoJsonObject = JObject.Parse(geoJson);
    var xmlDoc = new XmlDocument();
    var kml = xmlDoc.CreateElement("kml");
    var document = xmlDoc.CreateElement("Document");
    xmlDoc.AppendChild(kml);
    kml.AppendChild(document);

    foreach (var feature in geoJsonObject["features"])
    {
        var placemark = xmlDoc.CreateElement("Placemark");

        if (feature["properties"] != null)
        {
            foreach (var property in feature["properties"])
            {
                // Sanitiza el nombre de la propiedad
                var sanitizedPropertyName = SanitizePropertyName(property.Path);
                var name = xmlDoc.CreateElement(sanitizedPropertyName);
                name.InnerText = property.First?.ToString();
                placemark.AppendChild(name);
            }
        }

        if (feature["geometry"] != null)
        {
            var geometryType = feature["geometry"]["type"]?.ToString();
            if (geometryType == "Point")
            {
                var point = xmlDoc.CreateElement("Point");
                var coordinates = xmlDoc.CreateElement("coordinates");
                coordinates.InnerText = $"{feature["geometry"]["coordinates"][0]},{feature["geometry"]["coordinates"][1]}";
                point.AppendChild(coordinates);
                placemark.AppendChild(point);
            }
            else if (geometryType == "Polygon")
            {
                var polygon = xmlDoc.CreateElement("Polygon");
                var outerBoundary = xmlDoc.CreateElement("outerBoundaryIs");
                var linearRing = xmlDoc.CreateElement("LinearRing");
                var coordinates = xmlDoc.CreateElement("coordinates");

                foreach (var coord in feature["geometry"]["coordinates"].First)
                {
                    coordinates.InnerText += $"{coord[0]},{coord[1]} ";
                }

                linearRing.AppendChild(coordinates);
                outerBoundary.AppendChild(linearRing);
                polygon.AppendChild(outerBoundary);
                placemark.AppendChild(polygon);
            }
        }

        document.AppendChild(placemark);
    }

    using var stringWriter = new StringWriter();
    using var xmlTextWriter = new XmlTextWriter(stringWriter) { Formatting = System.Xml.Formatting.Indented };
    xmlDoc.WriteTo(xmlTextWriter);
    return stringWriter.ToString();
}



}