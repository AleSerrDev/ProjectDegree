namespace elGalloWebapi.App.Etities;
public class GeoJsonFeatureCollection
{
    public string Type { get; set; } = "FeatureCollection";
    public List<GeoJsonFeature> Features { get; set; } = new List<GeoJsonFeature>();
}

public class GeoJsonFeature
{
    public string Type { get; set; } = "Feature";
    public GeoJsonGeometry Geometry { get; set; }
    public GeoJsonProperties Properties { get; set; }
}

public class GeoJsonGeometry
{
    public string Type { get; set; } = "Polygon";
    public List<List<List<double>>> Coordinates { get; set; }
}

public class GeoJsonProperties
{
    public StoreInfo Store { get; set; }
    public StyleInfo Style { get; set; }
}

public class StoreInfo
{
    public int StoreId { get; set; }
    public string StoreName { get; set; }
    public string Icon { get; set; }
    public string UserId { get; set; }
    public List<double> Center { get; set; }
}

public class StyleInfo
{
    public string Stroke { get; set; } = "#000000";
    public double FillOpacity { get; set; } = 0.6;
    public int StrokeWidth { get; set; } = 2;
}