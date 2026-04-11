import os
import requests
import pandas as pd


def download_nhanes_file(cycle, file_desc, category, download_dir="nhanes_data"):
    category = category.lower()

    cycle_mapping = {
        "1999-2000": "1999","2001-2002": "2001","2003-2004": "2003","2005-2006": "2005",
        "2007-2008": "2007","2009-2010": "2009","2011-2012": "2011","2013-2014": "2013",
        "2015-2016": "2015","2017-2020": "2017","2021-2023": "2021"
    }

    year = cycle_mapping.get(cycle)
    if not year:
        return None

    nhanes_file_mapping = {
        "demographics": {
            "Demographic Variables & Sample Weights": {
                "1999":"DEMO","2001":"DEMO_B","2003":"DEMO_C","2005":"DEMO_D",
                "2007":"DEMO_E","2009":"DEMO_F","2011":"DEMO_G","2013":"DEMO_H",
                "2015":"DEMO_I","2017":"P_DEMO","2021":"DEMO_L"
            }
        },
        "examination": {
            "Body Measures": {
                "1999":"BMX","2001":"BMX_B","2003":"BMX_C","2005":"BMX_D",
                "2007":"BMX_E","2009":"BMX_F","2011":"BMX_G","2013":"BMX_H",
                "2015":"BMX_I","2017":"P_BMX","2021":"BMX_L"
            }
        },
        "questionnaire": {
            "Blood Pressure Questionnaire": {
                "1999":"BPQ","2001":"BPQ_B","2003":"BPQ_C","2005":"BPQ_D",
                "2007":"BPQ_E","2009":"BPQ_F","2011":"BPQ_G","2013":"BPQ_H",
                "2015":"BPQ_I","2017":"P_BPQ","2021":"BPQ_L"
            },
            "Diabetes": {
                "1999":"DIQ","2001":"DIQ_B","2003":"DIQ_C","2005":"DIQ_D",
                "2007":"DIQ_E","2009":"DIQ_F","2011":"DIQ_G","2013":"DIQ_H",
                "2015":"DIQ_I","2017":"P_DIQ","2021":"DIQ_L"
            }
        },
        "dietary": {
            "Total Nutrient Intake": {
                "1999":"DRXTOT","2001":"DRXTOT_B","2003":"DR1TOT_C","2005":"DR1TOT_D",
                "2007":"DR1TOT_E","2009":"DR1TOT_F","2011":"DR1TOT_G","2013":"DR1TOT_H",
                "2015":"DR1TOT_I","2017":"P_DR1TOT","2021":"DR1TOT_L"
            }
        }
    }

    file_name = nhanes_file_mapping.get(category, {}).get(file_desc, {}).get(year)
    if not file_name:
        return None

    url = f"https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/{year}/DataFiles/{file_name}.XPT"
    os.makedirs(download_dir, exist_ok=True)
    path = os.path.join(download_dir, f"{file_name}.XPT")

    if not os.path.exists(path):
        r = requests.get(url)
        if r.status_code != 200:
            return None
        open(path, "wb").write(r.content)

    df = pd.read_sas(path, format='xport')

    # ================= DEMO =================
    if category == "demographics":
        vars = ["SEQN","RIDAGEYR","RIDAGEMN","RIAGENDR","RIDRETH1",
                "DMDMARTL","RIDEXPRG","INDFMPIR","DMDHHSIZ","DMQMILIT"]

        if cycle == "2015-2016":
            vars.append("DMDYRSUS")
        elif cycle == "2017-2020":
            vars.append("DMDYRUSZ")
        elif cycle == "2021-2023":
            vars.append("DMDYRUSR")

        if cycle in ["1999-2000","2001-2002","2003-2004","2005-2006"]:
            vars.append("INDHHINC")
        elif cycle in ["2007-2008","2009-2010","2011-2012","2013-2014","2015-2016"]:
            vars.append("INDHHIN2")

        df = df[[v for v in vars if v in df.columns]]

    # ================= EXAM =================
    if category == "examination":
        vars = ["SEQN","BMXHT","BMXWT","BMXBMI","BMXWAIST","BMXARMC"]
        if cycle in ["2017-2020","2021-2023"]:
            vars.append("BMXHIP")
        df = df[[v for v in vars if v in df.columns]]

    # ================= BPQ =================
    if category == "questionnaire" and file_desc == "Blood Pressure Questionnaire":
        vars = ["SEQN","BPQ020","BPQ030","BPQ080"]
        if cycle == "2021-2023":
            vars += ["BPQ150","BPQ101D"]
        else:
            vars += ["BPQ050A","BPQ100D"]
        df = df[[v for v in vars if v in df.columns]]

       # ================= DIQ =================
    if category == "questionnaire" and file_desc == "Diabetes":
        vars = ["SEQN","DIQ010","DIQ050"]

        if cycle not in ["1999-2000","2001-2002","2003-2004"]:
            if "DIQ160" in df.columns:
                vars.append("DIQ160")

        if cycle == "1999-2000":
            vars.append("DIQ060G")
        elif cycle in ["2001-2002","2003-2004"]:
            vars.append("DID060G")
        else:
            vars.append("DID060")

        df = df[[v for v in vars if v in df.columns]]

    # ================= DIET =================
    if category == "dietary":
        vars = ["SEQN"]

        if cycle in ["1999-2000","2001-2002"]:
            vars += ["DRXTKCAL","DRXTPROT","DRXTCARB","DRXTFIBE",
                     "DRXTTFAT","DRXTSFAT","DRXTMFAT","DRXTPFAT","DRXTCHOL"]
            if cycle == "2001-2002":
                vars.append("DRXTSUGR")
        else:
            vars += ["DR1TKCAL","DR1TPROT","DR1TCARB","DR1TSUGR",
                     "DR1TFIBE","DR1TTFAT","DR1TSFAT","DR1TMFAT","DR1TPFAT","DR1TCHOL"]

        df = df[[v for v in vars if v in df.columns]]

    os.remove(path)
    return df


# ================= BUILDER =================
class PatientProfileBuilder:
    def __init__(self, download_function):
        self.download_function = download_function

    def build_profile(self, selections, cycles):
        all_dfs = []

        for category, info in selections.items():
            temp = []
            for cycle in cycles:
                df = self.download_function(cycle, info["file"], category)
                if df is not None:
                    temp.append(df)

            if temp:
                all_dfs.append(pd.concat(temp, ignore_index=True))

        if not all_dfs:
            return None

        final = all_dfs[0]
        for df in all_dfs[1:]:
            final = pd.merge(final, df, on="SEQN", how="outer")

        final.rename(columns={
            "SEQN": "ID",
            "RIDAGEYR": "Age",
            "RIDAGEMN": "Age_Months",
            "RIAGENDR": "Gender",
            "RIDRETH1": "Ethnicity",
            "DMDMARTL": "Marital_Status",
            "RIDEXPRG": "Pregnancy_Status",
            "INDFMPIR": "Income_Poverty_Ratio",
            "DMDHHSIZ": "Household_Size",
            "DMQMILIT": "Military_Status",
            "DMDYRSUS": "Years_in_US",
            "DMDYRUSZ": "Years_in_US",
            "DMDYRUSR": "Years_in_US",
            "INDHHINC": "Household_Income",
            "INDHHIN2": "Household_Income",

            "BMXHT": "Height_cm",
            "BMXWT": "Weight_kg",
            "BMXBMI": "BMI",
            "BMXWAIST": "Waist_cm",
            "BMXARMC": "Arm_Circumference",
            "BMXHIP": "Hip_Circumference",

            "BPQ020": "Ever_Told_High_BP",
            "BPQ030": "Taking_BP_Medication",
            "BPQ050A": "Doctor_Told_High_BP",
            "BPQ150": "Doctor_Told_High_BP",
            "BPQ080": "High_Cholesterol",
            "BPQ100D": "Cholesterol_Med",
            "BPQ101D": "Cholesterol_Med",

            "DIQ010": "Diabetes",
            "DIQ050": "Insulin",
            "DIQ160": "Prediabetes",
            "DIQ060G": "Insulin_At_Diagnosis",
            "DID060G": "Insulin_At_Diagnosis",
            "DID060": "Insulin_At_Diagnosis",

            "DRXTKCAL": "Calories","DR1TKCAL": "Calories",
            "DRXTPROT": "Protein","DR1TPROT": "Protein",
            "DRXTCARB": "Carbs","DR1TCARB": "Carbs",
            "DRXTSUGR": "Sugar","DR1TSUGR": "Sugar",
            "DRXTFIBE": "Fiber","DR1TFIBE": "Fiber",
            "DRXTTFAT": "Total_Fat","DR1TTFAT": "Total_Fat",
            "DRXTSFAT": "Sat_Fat","DR1TSFAT": "Sat_Fat",
            "DRXTMFAT": "Mono_Fat","DR1TMFAT": "Mono_Fat",
            "DRXTPFAT": "Poly_Fat","DR1TPFAT": "Poly_Fat",
            "DRXTCHOL": "Cholesterol","DR1TCHOL": "Cholesterol"
        }, inplace=True)

        os.makedirs("nhanes_data", exist_ok=True)
        final.to_csv("nhanes_data/merged_profile.csv", index=False)

        return final
