from app.services.fuel_service import calculate_fuel_consumption

def test_fuel_consumption_calculation():
    ship_data = {
        "normal_speed": 11.2,
        "fuel_consumption_rate": 85.0
    }
    # Calm water, no ice
    res_calm = calculate_fuel_consumption(
        distance_km=500.0,
        sea_ice_concentration=0.0,
        wind_speed_knots=10.0,
        wave_height_meters=1.0,
        ship_data=ship_data
    )
    assert res_calm["estimated_fuel_liters"] > 0
    assert res_calm["travel_time_hours"] > 0

    # Adverse conditions with heavy pack ice and gale
    res_rough = calculate_fuel_consumption(
        distance_km=500.0,
        sea_ice_concentration=70.0,
        wind_speed_knots=30.0,
        wave_height_meters=3.5,
        ship_data=ship_data
    )
    # Fuel consumption in ice and gale must be significantly higher than calm water
    assert res_rough["estimated_fuel_liters"] > res_calm["estimated_fuel_liters"]
    assert res_rough["environmental_multiplier"] > 1.3
