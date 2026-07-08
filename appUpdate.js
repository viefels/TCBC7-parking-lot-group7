import fs from "fs/promises";
import express from "express";
import path from "path";
const app = express();
app.use(express.json());

const PORT = 3000;

const jsonFilePath = path.join(import.meta.dirname, "data", "data.json")
const readFileFromPath = async (filePath) => JSON.parse(
  await fs.readFile(filePath, "utf-8"),
);

app.get("/api/v1/parking-lot-records", async (req, res) => {
  console.log("records")
  try{
    const records = await readFileFromPath(jsonFilePath);
    console.log("records")
    res.status(200).json({
      status: "success",
      data: {
        parkingLotRecords: records
      }
    })
  }
  catch(err){
    console.error("The actual error is:", err);
    res.status(500).json({
      status: "failed",
      message: "An error occured while fetching data, Please refresh or try again later"
    })
  }
});

app.get("/api/v1/parking-lot-records/:id", async (req, res) => {
  try{

    const id = Number(req.params.id);
    const records = await readFileFromPath(jsonFilePath);

    if (Number.isNaN(id)) {
      console.log(typeof id)
      return res.status(400).json({
        status: "failed",
        message: "ID is invalid, Please provide a valid number",
      });
    }

    const activeRecord = records.find((e) => e.id === id);
    if (!activeRecord) {
      return res.status(404).json({
        status: "failed",
        message: "ID not found, please recheck your input",
      });
    }
    
    res.status(200).json({
      status: "success",
      data: {
        queryResult: activeRecord || [],
      },
    });
  }
  catch(err){
    console.error("The actual error is:", err);
    res.status(500).json({
      status: "failed",
      message: "An error occurred while fetching data, Please refresh or try again later"
    })
  }
});

app.post("/api/v1/parking-lot-records", async (req, res) => {
  try{

    const records = await readFileFromPath(jsonFilePath);
    

    //incase deleted ones is available
    
    const getFreeId = records.findIndex((record,index) => Number(record.id - 1) !== index);

    const newId = records.length === 0 ? 1 : 
      getFreeId !== -1 ? getFreeId + 1 : records.length + 1;
    
    const newRecord = {
      id: newId,
      lotId: "PL-" + String(newId).padStart(3, "0"),
      plateNumber: req.body.plateNumber,
      ownerName: req.body.ownerName,
      vehicleType: req.body.vehicleType,
      status: "Parked",
      createdAt: req.body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    //modify data
    records.splice(newId-1, 0, newRecord),
    
    await fs.writeFile(jsonFilePath, JSON.stringify(records, null, 2));

    res.status(201).json({
      status: "success",
      data: { parkingLotRecord: newRecord }
    });
  }
  catch(err){
    console.error("The actual error is:", err);
    res.status(500).json({
      status: "failed",
      message: "An error occurred while fetching data, Please refresh or try again later"
    })
  }
});

app.delete("/api/v1/parking-lot-records/:id", async (req, res) => {
    try{

    const records = await readFileFromPath(jsonFilePath);
    const id = Number(req.params.id);
    
    if (Number.isNaN(id)) {
      console.log(typeof id)
      return res.status(400).json({
        status: "failed",
        message: "ID is invalid, Please provide a valid number",
      });
    }

    const activeRecord = records.find((e) => e.id === id);
    if (!activeRecord) {
      return res.status(404).json({
        status: "failed",
        message: "ID not found, please recheck your input",
      });
    }

    records.splice(id-1, 1);
    await fs.writeFile(jsonFilePath, JSON.stringify(records, null, 2));
    res.status(201).json({
      status: "success",
      message: "Car has been unparked successfully"
    });

    }
    catch(err){
        console.error("The actual error is:", err);
        res.status(500).json({
        status: "failed",
        message: "An error occurred while fetching data, Please refresh or try again later"
        });
    }
})


app.listen(PORT, () => {
  console.log(`Parking-lot app is running on port: ${PORT}`);
});
