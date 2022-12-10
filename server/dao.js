'use strict';

/* Data Access Object (DAO) module for accessing riddles and answers */

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('db/hike_tracker.db', (err) => {
    if (err) throw err;
});

exports.addPoint = (hikeID, lat, lon, alt, SP, EP, RP, label) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO Points(HikeID,Lat,Lon,Altitude,SP,EP,RP,Label) VALUES(?, ?,?, ?,?,?,?,?)'
        db.run(sql, [hikeID, lat, lon, alt, SP, EP, RP, label], function (err) {
            if (err) reject(err);
            resolve();
        });
    });
}

exports.deletePointsByHikeID = (hikeID) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM Points WHERE HikeID = ?", [hikeID], (err) => {
            if (err) reject(err);
            else resolve(null);
        });
    });
};

exports.deleteAllPoints = () => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM Points';
        db.all(sql, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

exports.addHut = (hutName, hutDescription, lat, lon, altitude, beds, state, region, province, municipality, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO Huts(Name, Description, Lat, Lon, Altitude, Beds, State, Region, Province, Municipality, Author) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        db.run(sql, [hutName, hutDescription, lat, lon, altitude, beds, state, region, province, municipality, userId], function (err) {
            if (err) reject(err);
            else {
                db.get('SELECT last_insert_rowid() AS ID', (err, row) => {
                    if (err) reject(err);
                    else if (row === undefined) resolve(false);
                    else
                        resolve({ id: row.ID });
                })
            }
        });
    });
}

exports.getHuts = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT H.*, FullName
                     FROM Huts H, Users U
                     WHERE H.Author = U.UserId`;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            const huts = rows.map((r) => ({
                id: r.HutID,
                hutName: r.Name,
                hutDescription: r.Description,
                lat: r.Lat,
                lon: r.Lon,
                altitude: r.Altitude,
                beds: r.Beds,
                state: r.State,
                region: r.Region,
                province: r.Province,
                municipality: r.Municipality,
                author: r.FullName
            }));
            resolve(huts);
        });
    });
}


exports.deleteHut = (hutID) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM Huts WHERE HutID = ?", [hutID], (err) => {
            if (err) reject(err);
            else resolve(null);
        });
    });
};


exports.deleteAllHuts = () => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM Huts';
        db.all(sql, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

exports.getHut = (hutID) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT H.*, FullName
                     FROM Huts H, Users U
                     WHERE HutID = ?
                     AND H.Author = U.UserId`;
        db.all(sql, [hutID], (err, rows) => {
            if (err) reject(err);
            else {
                if (rows.length === 0) resolve(undefined);
                else {
                    const hut = rows.map((r) => ({
                        id: r.HutID,
                        hutName: r.Name,
                        hutDescription: r.Description,
                        lat: r.Lat,
                        lon: r.Lon,
                        altitude: r.Altitude,
                        beds: r.Beds,
                        state: r.State,
                        region: r.Region,
                        province: r.Province,
                        municipality: r.Municipality,
                        author: r.FullName
                    }));
                    resolve(hut);
                }
            }
        });
    });
}

exports.updateHut = (name, description, lat, lon, altitude, beds, state, region, province, municipality, id) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE Huts SET Name=?, Description=?, Lat=?, Lon=?, Altitude= ?, Beds=?, State=?, Region=?, Province=?, Municipality=? WHERE HutID=?'
        db.run(sql, [name, description, lat, lon, altitude, beds, state, region, province, municipality, id], function (err) {
            if (err) reject(err);
            resolve();
        });
    });
}


exports.addHike = (trackName, len, time, ascent, diff, description, state, region, province, municipality, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO Hikes(Label, Length, ExpTime, Ascent, Difficulty, Description, State, Region, Province, Municipality, Author) VALUES(?,?,?,?,?,?,?,?,?,?,?)'
        db.run(sql, [trackName, len, time, ascent, diff, description, state, region, province, municipality, userId], function (err) {
            if (err) reject(err);
            resolve();
        });
    });

}

exports.getLastHikeID = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM Hikes ORDER BY HikeID DESC LIMIT 1';
        db.get(sql, [], (err, row) => {
            if (err) reject(err);
            let hike;
            if (row === undefined) hike = { id: 0 }
            else hike = { id: row.HikeID }

            resolve(hike.id);
        });
    });
}

exports.getStartPointOfHike = (hikeID) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM Points  WHERE HikeID=? and SP=?';
        db.get(sql, [hikeID, 1], (err, row) => {
            if (err) reject(err);
            let point;
            if (row === undefined) point = { lat: null, lon: null, alt: null }
            else point = { lat: row.Lat, lon: row.Lon, alt: row.Altitude }

            resolve(point);
        });
    });
}

exports.getEndPointOfHike = (hikeID) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM Points  WHERE HikeID=? and EP=?';
        db.get(sql, [hikeID, 1], (err, row) => {
            if (err) reject(err);
            let point;
            if (row === undefined) point = { lat: null, lon: null, alt: null }
            else point = { lat: row.Lat, lon: row.Lon, alt: row.Altitude }

            resolve(point);
        });
    });
}

exports.getHikes = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT H.HikeID, H.Label, H.Length, H.ExpTime, H.Ascent, H.Difficulty, H.Description,
                        H.State, H.Region, H. Province, H.Municipality, P.Lat, P.Lon, P.Label AS StartPointLabel, U.FullName
                     FROM Hikes H, Points P, Users U
                     WHERE H.HikeID = P.HikeID AND P.SP = 1
                     AND H.Author = U.UserId`;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            const hikes = rows.map((r) => ({
                id: r.HikeID,
                label: r.Label,
                length: r.Length,
                expTime: r.ExpTime,
                ascent: r.Ascent,
                difficulty: r.Difficulty,
                description: r.Description,
                state: r.State,
                region: r.Region,
                province: r.Province,
                municipality: r.Municipality,
                startPoint: {
                    latitude: r.Lat,
                    longitude: r.Lon,
                    label: r.StartPointLabel
                },
                author: r.FullName
            }));
            resolve(hikes);
        });
    });
}

exports.getParkingLots = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT P.*, FullName
                     FROM ParkingLots P, Users U
                     Where P.Author = U.UserId`;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            const pls = rows.map((r) => ({
                id: r.ParkingID, label: r.Label,
                description: r.Description, state: r.State, region: r.Region, province: r.Province, municipality: r.Municipality,
                lat: r.Lat, lon: r.Lon, altitude: r.Altitude, total: r.Total, occupied: r.Occupied, author: r.FullName
            }));
            resolve(pls);
        });
    });
}


// get a specific parking lot
exports.getParkingById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT P.*, FullName
                     FROM ParkingLots P, Users U
                     WHERE ParkingID = ?
                     AND P.Author = U.UserId`;
        db.all(sql, [id], (err, row) => {
            if (err) reject(err);
            const parking = row.map((r) => ({
                parkingID: r.ParkingID,
                label: r.Label,
                state: r.State,
                region: r.Region,
                province: r.Province,
                municipality: r.Municipality,
                description: r.Description,
                lat: r.Lat,
                lon: r.Lon,
                altitude: r.Altitude,
                total: r.Total,
                occupied: r.Occupied,
                author: r.FullName
            }));
            resolve(parking);
        });
    });
}

exports.getLastPArkingLotId = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM ParkingLots ORDER BY ParkingID DESC LIMIT 1';
        db.get(sql, [], (err, row) => {
            if (err) reject(err);
            let parking;
            if (row === undefined) parking = { id: 0 }
            else parking = { id: row.ParkingID }

            resolve(parking.id);
        });
    });
}
//Add new parking lot
exports.addParking = (Label, State, Region, Province, Municipality, Description, Lat, Lon, Altitude, Total, Occupied, UserId) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO PARKINGLOTS(Label, State, Region, Province, Municipality, Description, Lat, Lon, Altitude,Total, Occupied, Author) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        db.run(sql, [Label, State, Region, Province, Municipality, Description, Lat, Lon, Altitude, Total, Occupied, UserId], function (err) {
            if (err) reject(err);
            else {
                db.get('SELECT last_insert_rowid() AS ID', (err, row) => {
                    if (err) reject(err);
                    else if (row === undefined) resolve(false);
                    else
                        resolve({ id: row.ID });
                })
            }
        });
    });
}

// UPDATE parking lot
exports.updateParking = (Label, State, Region, Province, Municipality, Description, Lat, Lon, Altitude, Total, Occupied, parkingID) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE PARKINGLOTS SET Label=?, State=?, Region=?, Province=?, Municipality=?,Description=?, Lat=?, Lon=?, Altitude=?, Total=?, Occupied=?   WHERE ParkingID=?'
        db.run(sql, [Label, State, Region, Province, Municipality, Description, Lat, Lon, Altitude, Total, Occupied, parkingID], function (err) {
            if (err) reject(err);
            resolve();
        });
    });
}
//Delete parking lot
exports.deleteParking = (ParkingID) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM PARKINGLOTS WHERE ParkingID = ?", [ParkingID], (err) => {
            if (err) reject(err);
            else resolve(null);
        });
    });
};


//Delete all parking lots
exports.deleteAllParkingLots = () => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM PARKINGLOTS ", [], (err) => {
            if (err) reject(err);
            else resolve(null);
        });
    });
};

exports.getHikesRefPoints = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM Points WHERE RF=?';
        db.all(sql, [1], (err, rows) => {
            if (err) reject(err);
            const refpoints = rows.map((r) => ({
                id: r.PointID, hikeId: r.HikeID, label: r.Label, lat: r.Lat, lon: r.Lon
            }));
            resolve(refpoints);
        });
    });
}

exports.getHike = (hikeID) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT H.*, FullName
                     FROM HIKES H, Users U
                     WHERE HikeID = ?
                     AND H.Author = U.UserId`;
        db.all(sql, [hikeID], (err, rows) => {
            if (err) reject(err);
            else {
                if (rows.length === 0) resolve(undefined);
                else {
                    const hike = rows.map((r) => ({
                        id: r.HikeID,
                        label: r.Label,
                        length: r.Length,
                        expTime: r.ExpTime,
                        ascent: r.Ascent,
                        difficulty: r.Difficulty,
                        description: r.Description,
                        state: r.State,
                        region: r.Region,
                        province: r.Province,
                        municipality: r.Municipality,
                        author: r.FullName
                    }));
                    resolve(hike);
                }
            }
        });
    });
}

exports.getHikePoints = (hikeID) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM POINTS WHERE HikeID = ?';
        db.all(sql, [hikeID], (err, rows) => {
            if (err) reject(err);
            const points = rows.map((p) => ({ pointID: p.PointID, label: p.Label, latitude: p.Lat, longitude: p.Lon, startPoint: p.SP, endPoint: p.EP, referencePoint: p.RP }));
            resolve(points);
        });
    });
}

exports.deleteHike = (hikeID) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM HIKES WHERE HikeID = ?", [hikeID], (err) => {
            if (err) reject(err);
            else resolve(null);
        });
    });
};

exports.deleteAllHikes = () => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM Hikes';
        db.all(sql, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

exports.newHike = (label, length, expTime, ascent, difficulty, description, province, municipality) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO Hikes(Label, Length, ExpTime,Ascent,Difficulty,Description,Province,Municipality) VALUES(?,?,?,?,?,?,?,?)'
        db.run(sql, [label, length, expTime, ascent, difficulty, description, province, municipality], function (err) {
            if (err) reject(err);
            resolve();
        });
    });
}

exports.updateHike = (label, length, expTime, ascent, difficulty, description, state, region, province, municipality, hikeId) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE HIKES SET label=?,length=?,expTime=?,ascent=?,difficulty=?,description=?,state=?,region=?,province=?,municipality=? WHERE HikeId=?'
        db.run(sql, [label, length, expTime, ascent, difficulty, description, state, region, province, municipality, hikeId], function (err) {
            if (err) reject(err);
            resolve();
        });
    });
}

exports.getStartPoint = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM POINTS WHERE SP = 1';
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            const startPoint = rows.map((sp) => ({ hikeID: sp.HikeID, pointID: sp.PointID, label: sp.Label }));
            resolve(startPoint);
        });
    });
}

exports.getEndPoint = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM POINTS WHERE EP = 1';
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            const endPoint = rows.map((ep) => ({ hikeID: ep.HikeID, pointID: ep.PointID, label: ep.Label }));
            resolve(endPoint);
        });
    });
}

exports.getReferencePoint = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM POINTS WHERE RP = 1';
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            const referencePoint = rows.map((rp) => ({ hikeID: rp.HikeID, pointID: rp.PointID, label: rp.Label }));
            resolve(referencePoint);
        });
    });
}