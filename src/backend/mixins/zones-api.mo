// Public API mixin — Zones
// Exposes read-only zone list to the frontend
import ZoneLib "../lib/zones";
import ZoneTypes "../types/zones";
import List "mo:core/List";

mixin (zones : List.List<ZoneTypes.Zone>) {
  // Returns all delivery zones sorted by display_order
  public query func getZones() : async [ZoneTypes.Zone] {
    ZoneLib.listZones(zones);
  };
};
