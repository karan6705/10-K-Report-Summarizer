# backend/app.py

import os
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from your_pipeline import generate_annual_report

# 1️⃣ Load env
load_dotenv('.env.proj')

# 2️⃣ Create the app
app = FastAPI(
    title="Annual Report Extractor API"
)

# 3️⃣ Serve any generated PDF from the backend root under /reports
#    (PDFs are written into this same folder by your_pipeline)
app.mount(
    "/reports",
    StaticFiles(directory=".", html=False),
    name="reports",
)

@app.post("/api/extract")
async def extract(
    report: UploadFile = File(...),
    model: str = Form("gemini-2.0-flash")
):
    """
    Accepts a 10-K PDF upload + model selector, runs the pipeline,
    writes out `annual_report_<Company>_<Year>.pdf` in this directory,
    and returns a full URL to download it.
    """
    # save upload to a temp file
    tmp_path = f"/tmp/{report.filename}"
    with open(tmp_path, "wb") as f:
        f.write(await report.read())

    try:
        # generate and return the filename
        out_name = generate_annual_report(tmp_path, model)
    except Exception as e:
        raise HTTPException(500, f"Extraction failed: {e}")

    # build the full URL for the client to download
    download_url = f"http://localhost:8000/reports/{out_name}"
    return JSONResponse({"pdfUrl": download_url})

