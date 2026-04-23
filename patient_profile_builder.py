import os
import requests
import pandas as pd


# ================= LAB MAPPING =================
LAB_MAPPING = {
    "1999-2000": {
        "LAB10AM": ["LBXGLU","LBXIN"],
        "LAB25": ["LBXHGB","LBXHCT","LBXWBCSI","LBXRBCSI","LBXPLTSI"],
        "LAB13": ["LBXTC"],
        "LAB13AM": ["LBDLDL","LBXTR"],
        "LAB18": ["LBXSATSI","LBXSASSI","LBXSGTSI","LB2SBU","LBXSCR","LBXSUA","LBXSIR"],
        "LAB06": ["LBXFOL","LBXFER","LBXBPB","LBXBCD","LBXTHG","LBXSEL"],
        "LAB16": ["URXUMA"],
        "LAB26PP": ["URXUCR"],
        "VID_2_00": ["LB2VID"]
    },

    "2001-2002": {
        "L10AM_B": ["LBXGLU","LBXIN"],
        "L25_B": ["LBXHGB","LBXHCT","LBXWBCSI","LBXRBCSI","LBXPLTSI"],
        "L13_AM_B": ["LBXTC","LBDLDL","LBXTR"],
        "L40_B": ["LBXSATSI","LBXSASSI","LBXSGTSI","LB2SBU","LBXSCR","LBXSUA","LBXSIR"],
        "L06_B": ["LBXFOL","LBXFER","LBXBPB","LBXBCD","LBXTHG"],
        "L16_B": ["URXUMA","URXUCR"],
        "L06VID_B": ["LBXVID"]
    },

    "2003-2004": {
        "L10AM_C": ["LBXGLU","LBXIN"],
        "L25_C": ["LBXHGB","LBXHCT","LBXWBCSI","LBXRBCSI","LBXPLTSI"],
        "L13_C": ["LBXTC"],
        "L13_AM_C": ["LBDLDL","LBXTR"],
        "L40_C": ["LBXSATSI","LBXSASSI","LBXSGTSI","LB2SBU","LBXSCR","LBXSUA","LBXSIR"],
        "L06NB_C": ["LBXFOL"],
        "L06TFR_C": ["LBXFER"],
        "L06BMT_C": ["LBXBPB","LBXBCD","LBXTHG"],
        "L39EPP_C": ["LBXSEL"],
        "L16_C": ["URXUMA"],
        "L26UPP_C": ["URXUCR"],
        "L06VID_C": ["LBDVID"]
    },

    "2005-2006": {
        "GLU_D": ["LBXGLU","LBXIN"],
        "CBC_D": ["LBXHGB","LBXHCT","LBXWBCSI","LBXRBCSI","LBXPLTSI"],
        "TCHOL_D": ["LBXTC"],
        "TRIGLY_D": ["LBDLDL","LBXTR"],
        "BIOPRO_D": ["LBXSATSI","LBXSASSI","LBXSGTSI","LB2SBU","LBXSCR","LBXSUA","LBXSIR"],
        "FOLATE_D": ["LBXFOL"],
        "FERTIN_D": ["LBXFER"],
        "PBCD_D": ["LBXBPB","LBXBCD","LBXTHG"],
        "VID_D": ["LBDVIDMS"],
        "ALB_CR_D": ["URXUMA","URXUCR"]
    },

    "2007-2008": {
        "GLU_E": ["LBXGLU","LBXIN"],
        "CBC_E": ["LBXHGB","LBXHCT","LBXWBCSI","LBXRBCSI","LBXPLTSI"],
        "TCHOL_E": ["LBXTC"],
        "TRIGLY_E": ["LBDLDL","LBXTR"],
        "BIOPRO_E": ["LBXSATSI","LBXSASSI","LBXSGTSI","LB2SBU","LBXSCR","LBXSUA","LBXSIR"],
        "FOLATE_E": ["LBDFOL"],
        "FERTIN_E": ["LBXFER"],
        "PBCD_E": ["LBXBPB","LBXBCD","LBXTHG"],
        "VID_E": ["LBXVIDMS"],
        "ALB_CR_E": ["URXUMA","URXUCR"]
    },

    "2009-2010": {
        "GLU_F": ["LBXIN"],
        "CBC_F": ["LBXHGB","LBXHCT","LBXWBCSI","LBXRBCSI","LBXPLTSI"],
        "TCHOL_F": ["LBXTC"],
        "TRIGLY_F": ["LBDLDL","LBXTR"],
        "BIOPRO_F": ["LBXSATSI","LBXSASSI","LBXSGTSI","LB2SBU","LBXSCR","LBXSUA","LBXSIR"],
        "FOLATE_F": ["LBDFOL"],
        "FERTIN_F": ["LBXFER"],
        "PBCD_F": ["LBXBPB","LBXBCD","LBXTHG"],
        "VID_F": ["LBXVIDMS"],
        "ALB_CR_F": ["URXUMA","URXUCR"]
    },

    "2011-2012": {
        "GLU_G": ["LBXGLU","LBXIN"],
        "CBC_G": ["LBXHGB","LBXHCT","LBXWBCSI","LBXRBCSI","LBXPLTSI"],
        "TCHOL_G": ["LBXTC"],
        "TRIGLY_G": ["LBDLDL","LBXTR"],
        "BIOPRO_G": ["LBXSATSI","LBXSASSI","LBXSGTSI","LB2SBU","LBXSCR","LBXSUA","LBXSIR"],
        "FOLFMS_G": ["LBDFOT"],
        "PBCD_G": ["LBXBPB","LBXBCD","LBXTHG","LBXBMN","LBXBSE"],
        "VID_G": ["LBXVIDMS"],
        "ALB_CR_G": ["URXUMA","URXUCR"]
    },

    "2013-2014": {
        "GLU_H": ["LBXGLU"],
        "INS_H": ["LBXIN"],
        "CBC_H": ["LBXHGB","LBXHCT","LBXWBCSI","LBXRBCSI","LBXPLTSI"],
        "TCHOL_H": ["LBXTC"],
        "TRIGLY_H": ["LBDLDL","LBXTR"],
        "BIOPRO_H": ["LBXSATSI","LBXSASSI","LBXSGTSI","LB2SBU","LBXSCR","LBXSUA","LBXSIR"],
        "FOLFMS_H": ["LBDFOT"],
        "PBCD_H": ["LBXBPB","LBXBCD","LBXTHG","LBXBMN","LBXBSE"],
        "VID_H": ["LBXVIDMS"],
        "ALB_CR_H": ["URXUMA","URXUCR"]
    },

    "2015-2016": {
        "GLU_I": ["LBXGLU"],
        "INS_I": ["LBXIN"],
        "CBC_I": ["LBXHGB","LBXHCT","LBXWBCSI","LBXRBCSI","LBXPLTSI"],
        "TCHOL_I": ["LBXTC"],
        "TRIGLY_I": ["LBDLDL","LBXTR"],
        "BIOPRO_I": ["LBXSATSI","LBXSASSI","LBXSGTSI","LB2SBU","LBXSCR","LBXSUA","LBXSIR"],
        "FOLFMS_I": ["LBDFOT"],
        "FERTIN_I": ["LBXFER"],
        "PBCD_I": ["LBXBPB","LBXBCD","LBXTHG","LBXBMN","LBXBSE"],
        "VID_I": ["LBXVIDMS"],
        "ALB_CR_I": ["URXUMA","URXUCR"]
    },

    "2017-2020": {
        "P_GLU": ["LBXGLU"],
        "P_INS": ["LBXIN"],
        "P_CBC": ["LBXHGB","LBXHCT","LBXWBCSI","LBXRBCSI","LBXPLTSI"],
        "P_TCHOL": ["LBXTC"],
        "P_TRIGLY": ["LBDLDL","LBXTR"],
        "P_BIOPRO": ["LBXSATSI","LBXSASSI","LBXSGTSI","LB2SBU","LBXSCR","LBXSUA","LBXSIR"],
        "P_FOLFMS": ["LBDFOT"],
        "P_FERTIN": ["LBXFER"],
        "P_PBCD": ["LBXBPB","LBXBCD","LBXTHG","LBXBMN","LBXBSE"],
        "P_ALB_CR": ["URXUMA","URXUCR"]
    },

    "2021-2023": {
        "GLU_L": ["LBXGLU"],
        "INS_L": ["LBXIN"],
        "CBC_L": ["LBXHGB","LBXHCT","LBXWBCSI","LBXRBCSI","LBXPLTSI"],
        "TCHOL_L": ["LBXTC"],
        "TRIGLY_L": ["LBDLDL"],
        "BIOPRO_L": ["LBXTR","LBXSATSI","LBXSASSI","LBXSGTSI","LB2SBU","LBXSCR","LBXSUA","LBXSIR"],
        "FOLFMS_L": ["LBDFOT"],
        "FERTIN_L": ["LBXFER"],
        "PBCD_L": ["LBXBPB","LBXBCD","LBXTHG","LBXBMN","LBXBSE"],
        "VID_L": ["LBXVIDMS"],
        "ALB_CR_L": ["URXUMA","URXUCR"]
    }
}


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

    # ================= LABORATORY =================
    if category == "laboratory":
        if cycle not in LAB_MAPPING:
            return None

        dfs = []
        for file_name, variables in LAB_MAPPING[cycle].items():
            url = f"https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/{year}/DataFiles/{file_name}.XPT"
            path = os.path.join(download_dir, f"{file_name}.XPT")

            os.makedirs(download_dir, exist_ok=True)

            if not os.path.exists(path):
                r = requests.get(url)
                if r.status_code != 200:
                    continue
                open(path, "wb").write(r.content)

            df = pd.read_sas(path, format='xport')
            keep = ["SEQN"] + [v for v in variables if v in df.columns]
            df = df[keep]

            dfs.append(df)
            os.remove(path)

        if not dfs:
            return None

        final_lab = dfs[0]
        for d in dfs[1:]:
            final_lab = pd.merge(final_lab, d, on="SEQN", how="outer")

        return final_lab

    # ================= ORIGINAL DATASETS =================
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
    path = os.path.join(download_dir, f"{file_name}.XPT")

    os.makedirs(download_dir, exist_ok=True)

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

        # ================= RENAME =================
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
            "DRXTCHOL": "Cholesterol","DR1TCHOL": "Cholesterol",

            # ================= LAB VARIABLES =================
            "LBXGLU": "Glucose",
            "LBXIN": "Insulin_Lab",

            "LBXHGB": "Hemoglobin",
            "LBXHCT": "Hematocrit",
            "LBXWBCSI": "WBC",
            "LBXRBCSI": "RBC",
            "LBXPLTSI": "Platelets",

            "LBXTC": "Total_Cholesterol",
            "LBDLDL": "LDL",
            "LBXTR": "Triglycerides",

            "LBXSATSI": "ALT",
            "LBXSASSI": "AST",
            "LBXSGTSI": "GGT",
            "LB2SBU": "BUN",
            "LBXSCR": "Creatinine",
            "LBXSUA": "Uric_Acid",

            "LBXVIDMS": "Vitamin_D",
            "LBDVID": "Vitamin_D",
            "LB2VID": "Vitamin_D",

            "LBXFOL": "Folate",
            "LBDFOL": "Folate",
            "LBDFOT": "Folate",
            "SSFOLTOT": "Folate",

            "LBXSIR": "Iron",
            "LBXFER": "Ferritin",

            "LBXBPB": "Lead",
            "LBXBCD": "Cadmium",
            "LBXTHG": "Mercury",
            "LBXSEL": "Selenium",

            "URXUMA": "Urine_Albumin",
            "URXUCR": "Urine_Creatinine"

        }, inplace=True)

        os.makedirs("nhanes_data", exist_ok=True)
        final.to_csv("nhanes_data/merged_profile.csv", index=False)

        return final
