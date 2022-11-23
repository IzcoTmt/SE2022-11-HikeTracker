const dao = require('../dao'); // module for accessing the DB

describe("test Hikes functions", () => {
  deleteAllHikesTest();
  newHikeTest();
  test("Test for get given hike id", async () => {
    // With given id (1), get specific hikeID and matches it
    const hikeID = 1
    const hike = await dao.getHike(hikeID);
    expect(hike[0].id).toStrictEqual(hikeID);
  });
  deleteAllHikesTest();
  newHikeTest();
  test("Test for get list of hikes", async () => {
    // insert new hike to hikes db and checks the list of hikes can we get or not
    const hikes = await dao.getHikes();
    const hike = await dao.newHike("Sentiero degli Dei", 8000.0, 5, 13.0, 1, "Best hike for a sun-kissed stroll", "Campania", "Salerno");
    const hikesList = await dao.getHikes();
    expect(hikes.length + 1).toStrictEqual(hikesList.length);
  });



})

describe("CRUD Hikes functions", () => {
  deleteAllHikesTest();
  newHikeTest();
  updateHikeTest();
  deleteHikeTest();
});

function deleteAllHikesTest() {
  test('delete db', async () => {
    await dao.deleteAllHikes();
    let res = await dao.getHikes();
    expect(res.length).toStrictEqual(0);
  });
}

function newHikeTest() {
  test('create new hike', async () => {
    await dao.deleteAllHikes();
    let res = await dao.getHikes();
    expect(res.length).toStrictEqual(0);

    let data = {
      label: "Gran Paradiso",
      length: 20500,
      expTime: 10,
      ascent: 23,
      difficulty: "3",
      description: "Alpine challenge",
      province: "Piemonte",
      municipality: "Cogne"
    };

    await dao.newHike(data.label,
      data.length,
      data.expTime,
      data.ascent,
      data.difficulty,
      data.description,
      data.province,
      data.municipality);

    res = await dao.getHikes();
    expect(res.length).toStrictEqual(1);

    res = await dao.getHike(1);
    let hike = res[0];

    expect(hike.label).toStrictEqual(data.label);
    expect(hike.length).toStrictEqual(data.length);
    expect(hike.expTime).toStrictEqual(data.expTime);
    expect(hike.ascent).toStrictEqual(data.ascent);
    expect(hike.difficulty).toStrictEqual(data.difficulty);
    expect(hike.description).toStrictEqual(data.description);
    expect(hike.province).toStrictEqual(data.province);
    expect(hike.municipality).toStrictEqual(data.municipality);
  });
}

function updateHikeTest() {
  test('update an hike', async () => {

    await dao.deleteAllHikes();
    let res = await dao.getHikes();
    expect(res.length).toStrictEqual(0);


    let data = {
      label: "Gran Paradiso",
      length: 20500,
      expTime: 100,
      ascent: 23,
      difficulty: "3",
      description: "Alpine challenge 0",
      province: "Piemonte",
      municipality: "Cogne"
    };

    await dao.newHike(data.label,
      data.length,
      data.expTime,
      data.ascent,
      data.difficulty,
      data.description,
      data.province,
      data.municipality);

    res = await dao.getHikes();
    expect(res.length).toStrictEqual(1);

    let id = 1;

    let newData = {
      label: "Gran Paradiso",
      length: 20500,
      expTime: 10,
      ascent: 23,
      difficulty: "3",
      description: "Alpine challenge",
      province: "Piemonte",
      municipality: "Cogne"
    };

    await dao.updateHike(newData.label,
      newData.length,
      newData.expTime,
      newData.ascent,
      newData.difficulty,
      newData.description,
      newData.province,
      newData.municipality,
      id);

    res = await dao.getHikes();
    expect(res.length).toStrictEqual(1);
    res = await dao.getHike(1);
    expect(res.length).toStrictEqual(1);
    let hike = res[0];

    expect(hike.label).toStrictEqual(newData.label);
    expect(hike.length).toStrictEqual(newData.length);
    expect(hike.expTime).toStrictEqual(newData.expTime);
    expect(hike.ascent).toStrictEqual(newData.ascent);
    expect(hike.difficulty).toStrictEqual(newData.difficulty);
    expect(hike.description).toStrictEqual(newData.description);
    expect(hike.province).toStrictEqual(newData.province);
    expect(hike.municipality).toStrictEqual(newData.municipality);
  });
}

function deleteHikeTest() {
  test('delete an hike', async () => {

    await dao.deleteAllHikes();
    let res = await dao.getHikes();
    expect(res.length).toStrictEqual(0);


    let data = {
      label: "Gran Paradiso",
      length: 20500,
      expTime: 100,
      ascent: 23,
      difficulty: "3",
      description: "Alpine challenge 0",
      province: "Piemonte",
      municipality: "Cogne"
    };

    await dao.newHike(data.label,
      data.length,
      data.expTime,
      data.ascent,
      data.difficulty,
      data.description,
      data.province,
      data.municipality);

    res = await dao.getHikes();
    expect(res.length).toStrictEqual(1);

    let id = await dao.getLastHikeID();

    await dao.deleteHike(id);
    res = await dao.getHikes();
    expect(res.length).toStrictEqual(0);
  });
}
