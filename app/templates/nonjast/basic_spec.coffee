Alloy = require("alloy")
describe "Index Tests", ->
  it "must have a white background", ->
    index = Alloy.createController("index")
    expect(index.getView().backgroundColor).toBe "white"


