import os
import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils.dataframe import dataframe_to_rows

def build_excel_workbook():
    reports_dir = r"C:\Users\SANDEEP ROSHAN S D\OneDrive\Desktop\VitaWatchAI\vitawatch_dummy_reports"
    output_xlsx = os.path.join(reports_dir, "vitawatch_comprehensive_telemetry.xlsx")

    # Load data from the generated CSV files
    vitals_path = os.path.join(reports_dir, "vitals_telemetry.csv")
    sleep_path = os.path.join(reports_dir, "sleep_analytics.csv")
    mood_path = os.path.join(reports_dir, "mood_stress_logs.csv")
    cog_path = os.path.join(reports_dir, "cognitive_performance.csv")
    em_path = os.path.join(reports_dir, "emergency_incidents.csv")

    sheets_data = {}
    if os.path.exists(vitals_path):
        # We take the first 200 rows of vitals to avoid massive file bloating in Excel view, while showing enough high-resolution telemetry
        sheets_data["Vitals Telemetry"] = pd.read_csv(vitals_path).head(200)
    if os.path.exists(sleep_path):
        sheets_data["Sleep Analytics"] = pd.read_csv(sleep_path)
    if os.path.exists(mood_path):
        sheets_data["Mood & Stress Logs"] = pd.read_csv(mood_path)
    if os.path.exists(cog_path):
        sheets_data["Cognitive Performance"] = pd.read_csv(cog_path)
    if os.path.exists(em_path):
        sheets_data["Emergency Incidents"] = pd.read_csv(em_path)

    # Style presets
    header_fill = PatternFill(start_color="0B1528", end_color="0B1528", fill_type="solid") # Deep navy
    header_font = Font(name="Calibri", size=11, bold=True, color="00D4FF") # Neon cyan font
    
    alert_fill = PatternFill(start_color="FFCCD5", end_color="FFCCD5", fill_type="solid") # Rose alert
    alert_font = Font(name="Calibri", size=10, bold=True, color="FF3366") # Crimson alert font
    
    thin_border = Border(
        left=Side(style='thin', color='DDDDDD'),
        right=Side(style='thin', color='DDDDDD'),
        top=Side(style='thin', color='DDDDDD'),
        bottom=Side(style='thin', color='DDDDDD')
    )

    wb = Workbook()
    # Remove default sheet
    default_sheet = wb.active
    wb.remove(default_sheet)

    for sheet_name, df in sheets_data.items():
        ws = wb.create_sheet(title=sheet_name)
        
        # Write dataframe rows to sheet
        for r in dataframe_to_rows(df, index=False, header=True):
            ws.append(r)
            
        # Format table cells
        ws.row_dimensions[1].height = 24
        
        for col_idx, col in enumerate(ws.columns, 1):
            # Set headers styles
            cell = ws.cell(row=1, column=col_idx)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center", vertical="center")
            cell.border = thin_border
            
            # Format data rows
            max_len = len(str(cell.value or ''))
            for row_idx in range(2, ws.max_row + 1):
                c = ws.cell(row=row_idx, column=col_idx)
                c.font = Font(name="Calibri", size=10)
                c.border = thin_border
                c.alignment = Alignment(horizontal="center", vertical="center")
                
                # Check for critical alerts in Emergency logs or Stress scores
                cell_val = str(c.value or '')
                if cell_val in ["Critical", "Fall Detected", "Warning"]:
                    c.fill = alert_fill
                    c.font = alert_font
                
                max_len = max(max_len, len(cell_val))
            
            # Auto-adjust column width to fit content comfortably
            col_letter = chr(64 + col_idx) if col_idx <= 26 else f"A{chr(64 + (col_idx - 26))}"
            ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

    wb.save(output_xlsx)
    print(f"Beautiful multi-sheet Excel workbook created successfully at: {output_xlsx}")

if __name__ == "__main__":
    build_excel_workbook()
