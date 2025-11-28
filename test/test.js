import assert from "assert";
import { plants } from "../src/lib/plant-data.ts";
//voorbeeld test
describe("#voorbeeld test", function () {
  it("2 + 2 is gelijk aan 4", function () {
    assert.equal(2 + 2, 4);
  });
});

// Test of de plants array niet leeg is
describe("Planten data tests", function () {
  it("plants array bevat items", function () {
    assert.ok(plants.length > 0);
  });

  // Test of de planten een naam hebben
  it("elke plant heeft een naam", function () {
    plants.forEach((plant) => {
      assert.ok(plant.name);
    });
  });

  // Test of geen planten op dezelfde plek staan (dus op zelfde x en y cordinaten)
  it("planten overlappen niet", function () {
    plants.forEach((plant1, index) => {
      plants.slice(index + 1).forEach((plant2) => {
        // Check of die x en y coordinaten het zelfde zijn
        const zelfdePositie = plant1.position.x === plant2.position.x && 
                              plant1.position.y === plant2.position.y;
        assert.ok(!zelfdePositie, 
          `Plant "${plant1.name}" en "${plant2.name}" staan op dezelfde plek`);
      });
    });
  });
});