import os
import requests
import pandas as pd


def download_nhanes_file(cycle, file_desc, category, download_dir="nhanes_data"):
    print(f"DEBUG: Requested -> Cycle: {cycle}, Description: {file_desc}, Category: {category}")

    category = category.lower()

    cycle_mapping = {
        "1999-2000": "1999",
        "2001-2002": "2001",
        "2003-2004": "2003",
        "2005-2006": "2005",
        "2007-2008": "2007",
        "2009-2010": "2009",
        "2011-2012": "2011",
        "2013-2014": "2013",
        "2015-2016": "2015",
        "2017-2020": "2017",
        "2021-2023": "2021"
    }

    cycle_single_year = cycle_mapping.get(cycle, None)
    if not cycle_single_year:
        print(f"ERROR: Cycle '{cycle}' not recognized!")
        return None

    nhanes_file_mapping = {
        "demographics": {
            "Demographic Variables & Sample Weights": {
                "1999": "DEMO",
                "2001": "DEMO_B",
                "2003": "DEMO_C",
                "2005": "DEMO_D",
                "2007": "DEMO_E",
                "2009": "DEMO_F",
                "2011": "DEMO_G",
                "2013": "DEMO_H",
                "2015": "DEMO_I",
                "2017": "P_DEMO",
                "2021": "DEMO_L"
            }
        },
        "examination": {
            "Body Measures": {
                "1999": "BMX",
                "2001": "BMX_B",
                "2003": "BMX_C",
                "2005": "BMX_D",
                "2007": "BMX_E",
                "2009": "BMX_F",
                "2011": "BMX_G",
                "2013": "BMX_H",
                "2015": "BMX_I",
                "2017": "P_BMX",
                "2021": "BMX_L"
            }
        },
        "questionnaire": {
            "Blood Pressure Questionnaire": {
                "1999": "BPQ",
                "2001": "BPQ_B",
                "2003": "BPQ_C",
                "2005": "BPQ_D",
                "2007": "BPQ_E",
                "2009": "BPQ_F",
                "2011": "BPQ_G",
                "2013": "BPQ_H",
                "2015": "BPQ_I",
                "2017": "P_BPQ",
                "2021": "BPQ_L"
            },
            "Diabetes": {
                "1999": "DIQ",
                "2001": "DIQ_B",
                "2003": "DIQ_C",
                "2005": "DIQ_D",
                "2007": "DIQ_E",
                "2009": "DIQ_F",
                "2011": "DIQ_G",
                "2013": "DIQ_H",
                "2015": "DIQ_I",
                "2017": "P_DIQ",
                "2021": "DIQ_L"
            }
        },
        "dietary": {
            "Total Nutrient Intake": {
                "1999": "DRXTOT",
                "2001": "DRXTOT_B",
                "2003": "DR1TOT_C",
                "2005": "DR1TOT_D",
                "2007": "DR1TOT_E",
                "2009": "DR1TOT_F",
                "2011": "DR1TOT_G",
                "2013": "DR1TOT_H",
                "2015": "DR1TOT_I",
                "2017": "P_DR1TOT",
                "2021": "DR1TOT_L"
            }
        },
        "laboratory": {
            "Cholesterol - Total": {
                "1999": "LAB13",
                "2001": "L13_B",
                "2003": "L13_C",
                "2005": "TCHOL_D",
                "2007": "TCHOL_E",
                "2009": "TCHOL_F",
                "2011": "TCHOL_G",
                "2013": "TCHOL_H",
                "2015": "TCHOL_I",
                "2017": "P_TCHOL",
                "2021": "TCHOL_L"
            },
            "Cholesterol - LDL & Triglycerides": {
                "1999": "LAB13AM",
                "2001": "L13AM_B",
                "2003": "L13AM_C",
                "2005": "TRIGLY_D",
                "2007": "TRIGLY_E",
                "2009": "TRIGLY_F",
                "2011": "TRIGLY_G",
                "2013": "TRIGLY_H",
                "2015": "TRIGLY_I",
                "2017": "P_TRIGLY",
                "2021": "TRIGLY_L"
            },
            "Cholesterol - HDL": {
                "1999": "LAB13",
                "2001": "L13_B",
                "2003": "L13_C",
                "2005": "HDL_D",
                "2007": "HDL_E",
                "2009": "HDL_F",
                "2011": "HDL_G",
                "2013": "HDL_H",
                "2015": "HDL_I",
                "2017": "P_HDL",
                "2021": "HDL_L"
            },
            "Glucose & Insulin": {
                "1999": "LAB10AM",
                "2001": "L10AM_B",
                "2003": "L10AM_C",
                "2005": "GLU_D",
                "2007": "GLU_E",
                "2009": "GLU_F",
                "2011": "GLU_G",
                "2013": "GLU_H",
                "2015": "GLU_I",
                "2017": "P_GLU",
                "2021": "GLU_L"
            }
        }
    }

    file_name = nhanes_file_mapping.get(category, {}).get(file_desc, {}).get(cycle_single_year, None)
    if not file_name:
        print("ERROR: No file mapping found.")
        return None

    url = f"https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/{cycle_single_year}/DataFiles/{file_name}.XPT"

    os.makedirs(download_dir, exist_ok=True)
    xpt_path = os.path.join(download_dir, f"{file_name}.XPT")

    if not os.path.exists(xpt_path):
        response = requests.get(url)
        if response.status_code != 200:
            print("ERROR: Download failed.")
            return None
        with open(xpt_path, "wb") as f:
            f.write(response.content)

    try:
        df = pd.read_sas(xpt_path, format='xport')

        # ========== FIX: Handle NHANES missing value codes ==========
        missing_codes = [
            5.39760534693403E-79,
            7.88860905221012E-31,
            9.96920996838687E-36,
        ]
        df = df.replace(missing_codes, float('nan'))

        # ================= DEMO =================
        if category == "demographics":
            vars = ["SEQN", "RIDAGEYR", "RIDAGEMN", "RIAGENDR", "RIDRETH1",
                    "DMDMARTL", "RIDEXPRG", "INDFMPIR", "DMDHHSIZ", "DMQMILIT"]

            if cycle == "2015-2016":
                vars.append("DMDYRSUS")
            elif cycle == "2017-2020":
                vars.append("DMDYRUSZ")
            elif cycle == "2021-2023":
                vars.append("DMDYRUSR")

            if cycle in ["1999-2000", "2001-2002", "2003-2004", "2005-2006"]:
                vars.append("INDHHINC")
            elif cycle in ["2007-2008", "2009-2010", "2011-2012", "2013-2014", "2015-2016"]:
                vars.append("INDHHIN2")

            df = df[[v for v in vars if v in df.columns]]

        # ================= EXAM =================
        if category == "examination":
            vars = ["SEQN", "BMXHT", "BMXWT", "BMXBMI", "BMXWAIST", "BMXARMC"]
            if cycle in ["2017-2020", "2021-2023"]:
                vars.append("BMXHIP")
            df = df[[v for v in vars if v in df.columns]]

        # ================= BPQ =================
        if category == "questionnaire" and file_desc == "Blood Pressure Questionnaire":
            vars = ["SEQN", "BPQ020", "BPQ030", "BPQ080"]
            if cycle == "2021-2023":
                vars += ["BPQ150", "BPQ101D"]
            else:
                vars += ["BPQ050A", "BPQ100D"]
            df = df[[v for v in vars if v in df.columns]]

        # ================= DIQ =================
        if category == "questionnaire" and file_desc == "Diabetes":
            vars = ["SEQN", "DIQ010", "DIQ050"]

            if cycle not in ["1999-2000", "2001-2002", "2003-2004"]:
                if "DIQ160" in df.columns:
                    vars.append("DIQ160")

            if cycle == "1999-2000":
                vars.append("DIQ060G")
            elif cycle in ["2001-2002", "2003-2004"]:
                vars.append("DID060G")
            else:
                vars.append("DID060")

            df = df[[v for v in vars if v in df.columns]]

        # ================= DIET =================
        if category == "dietary":
            vars = ["SEQN"]

            if cycle in ["1999-2000", "2001-2002"]:
                vars += ["DRXTKCAL", "DRXTPROT", "DRXTCARB", "DRXTFIBE",
                         "DRXTTFAT", "DRXTSFAT", "DRXTMFAT", "DRXTPFAT", "DRXTCHOL"]
                if cycle == "2001-2002":
                    vars.append("DRXTSUGR")
            else:
                vars += ["DR1TKCAL", "DR1TPROT", "DR1TCARB", "DR1TSUGR",
                         "DR1TFIBE", "DR1TTFAT", "DR1TSFAT", "DR1TMFAT", "DR1TPFAT", "DR1TCHOL"]

            df = df[[v for v in vars if v in df.columns]]

        # ================= LABORATORY =================
        if category == "laboratory":
            vars = ["SEQN"]

            if file_desc == "Cholesterol - Total":
                vars.append("LBXTC")
            elif file_desc == "Cholesterol - LDL & Triglycerides":
                vars += ["LBDLDL", "LBXTR"]
                # Some cycles have HDL in this file too
                if "LBDHDD" in df.columns:
                    vars.append("LBDHDD")
                elif "LBDHDL" in df.columns:
                    vars.append("LBDHDL")
            elif file_desc == "Cholesterol - HDL":
                if "LBDHDD" in df.columns:
                    vars.append("LBDHDD")
                elif "LBDHDL" in df.columns:
                    vars.append("LBDHDL")
            elif file_desc == "Glucose & Insulin":
                vars += ["LBXGLU", "LBXIN"]

            df = df[[v for v in vars if v in df.columns]]

        os.remove(xpt_path)
        return df

    except Exception as e:
        print(f"ERROR reading file: {e}")
        return None


def apply_filters(df, filters):
    """
    Apply filters to the DataFrame.
    Supports multiple races using isin().
    """
    if df.empty:
        return df

    # Gender filter
    if "gender" in filters and filters["gender"]:
        gender_map = {"Male": 1, "Female": 2}
        if isinstance(filters["gender"], list):
            gender_codes = [gender_map[g] for g in filters["gender"] if g in gender_map]
        else:
            gender_codes = [gender_map[filters["gender"]]] if filters["gender"] in gender_map else []
        if gender_codes:
            df = df[df["RIAGENDR"].isin(gender_codes)]

    # Race/Ethnicity filter
    if "race" in filters and filters["race"]:
        race_map = {
            "Mexican American": 1,
            "Other Hispanic": 2,
            "Non-Hispanic White": 3,
            "Non-Hispanic Black": 4,
            "Non-Hispanic Asian": 6,
            "Other": 7
        }
        if isinstance(filters["race"], list):
            race_codes = [race_map[r] for r in filters["race"] if r in race_map]
        else:
            race_codes = [race_map[filters["race"]]] if filters["race"] in race_map else []

        if race_codes:
            df = df[df["RIDRETH1"].isin(race_codes)]

    # Age filter
    if "age" in filters and filters["age"]:
        age_range = filters["age"]
        df["RIDAGEYR"] = pd.to_numeric(df["RIDAGEYR"], errors="coerce")

        if "-" in age_range:
            lower, upper = map(int, age_range.split("-"))
            df = df[(df["RIDAGEYR"] >= lower) & (df["RIDAGEYR"] <= upper)]
        elif age_range == "80+":
            df = df[df["RIDAGEYR"] >= 80]
        elif age_range == "60+":
            df = df[df["RIDAGEYR"] >= 60]

    return df


class PatientProfileBuilder:
    def __init__(self, download_function):
        self.download_function = download_function

    def build_profile(self, selections, cycles, requested_biomarkers=None):
        """
        Build patient profile with support for specific biomarker selection.

        Args:
            selections: Dictionary of category selections
            cycles: List of NHANES cycles
            requested_biomarkers: Optional dict of {category: [biomarker_list]} to filter columns
        """
        all_dfs_by_category = {}

        # Download data for each category
        for category, info in selections.items():
            temp = []
            for cycle in cycles:
                df = self.download_function(cycle, info["file"], category)
                if df is not None:
                    # Add cycle column to prevent cross-cycle contamination
                    df['cycle'] = cycle

                    # Filter columns if specific biomarkers requested for this category
                    if requested_biomarkers and category in requested_biomarkers:
                        requested = requested_biomarkers[category]
                        # Always keep SEQN and cycle for merging
                        cols_to_keep = ['SEQN', 'cycle']
                        # Add requested biomarkers that exist in the dataframe
                        for biomarker in requested:
                            if biomarker in df.columns:
                                cols_to_keep.append(biomarker)
                        df = df[[c for c in cols_to_keep if c in df.columns]]

                    temp.append(df)

            if temp:
                all_dfs_by_category[category] = pd.concat(temp, ignore_index=True)

        if not all_dfs_by_category:
            return None

        # Start with demographics (apply filters here)
        if "demographics" in all_dfs_by_category:
            final_df = all_dfs_by_category["demographics"]
            filters = selections["demographics"].get("filters", {})
            final_df = apply_filters(final_df, filters)
        else:
            # If no demographics, use first available category
            first_key = list(all_dfs_by_category.keys())[0]
            final_df = all_dfs_by_category[first_key]

        # Merge with other categories on SEQN and cycle
        for category, df in all_dfs_by_category.items():
            if category != "demographics":
                # Check if we need to rename SEQN in the secondary dataframe
                if 'SEQN' not in df.columns and 'SEQN' in df.columns:
                    pass  # SEQN exists
                final_df = pd.merge(final_df, df, on=["SEQN", "cycle"], how="inner")

        # ----------------------------
        # Convert codes to readable
        # ----------------------------

        # Gender
        if "RIAGENDR" in final_df.columns:
            final_df["RIAGENDR"] = final_df["RIAGENDR"].map({
                1: "Male",
                2: "Female"
            })

        # Ethnicity
        if "RIDRETH1" in final_df.columns:
            final_df["RIDRETH1"] = final_df["RIDRETH1"].map({
                1: "Mexican American",
                2: "Other Hispanic",
                3: "Non-Hispanic White",
                4: "Non-Hispanic Black",
                6: "Non-Hispanic Asian",
                7: "Other"
            })

        # Diabetes (DIQ010)
        if "DIQ010" in final_df.columns:
            final_df["DIQ010"] = final_df["DIQ010"].map({
                1: "Yes",
                2: "No",
                3: "Borderline",
                7: "Refused",
                9: "Don't Know"
            })

        # Rename columns to readable names
        final_df.rename(columns={
            "SEQN": "ID",
            "RIDAGEYR": "Age",
            "RIDAGEMN": "Age_Months",
            "RIAGENDR": "Gender",
            "RIDRETH1": "Race_Ethnicity",
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

            "DIQ010": "Diabetes_Diagnosed",
            "DIQ050": "Insulin",
            "DIQ160": "Prediabetes",
            "DIQ060G": "Insulin_At_Diagnosis",
            "DID060G": "Insulin_At_Diagnosis",
            "DID060": "Insulin_At_Diagnosis",

            "DRXTKCAL": "Calories", "DR1TKCAL": "Calories",
            "DRXTPROT": "Protein", "DR1TPROT": "Protein",
            "DRXTCARB": "Carbs", "DR1TCARB": "Carbs",
            "DRXTSUGR": "Sugar", "DR1TSUGR": "Sugar",
            "DRXTFIBE": "Fiber", "DR1TFIBE": "Fiber",
            "DRXTTFAT": "Total_Fat", "DR1TTFAT": "Total_Fat",
            "DRXTSFAT": "Sat_Fat", "DR1TSFAT": "Sat_Fat",
            "DRXTMFAT": "Mono_Fat", "DR1TMFAT": "Mono_Fat",
            "DRXTPFAT": "Poly_Fat", "DR1TPFAT": "Poly_Fat",
            "DRXTCHOL": "Cholesterol", "DR1TCHOL": "Cholesterol",

            # Laboratory biomarkers
            "LBXTC": "Total_Cholesterol",
            "LBDLDL": "LDL_Cholesterol",
            "LBDHDD": "HDL_Cholesterol",
            "LBDHDL": "HDL_Cholesterol",
            "LBXTR": "Triglycerides",
            "LBXGLU": "Fasting_Glucose",
            "LBXIN": "Insulin_Level",

            "cycle": "Survey_Cycle"
        }, inplace=True)

        os.makedirs("nhanes_data", exist_ok=True)
        final_df.to_csv("nhanes_data/merged_profile.csv", index=False)

        return final_df
