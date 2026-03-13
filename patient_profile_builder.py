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
        "questionnaire": {
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

        if category == "demographics":
            df = df[["SEQN", "RIDAGEYR", "RIAGENDR", "RIDRETH1"]]

        if category == "questionnaire":
            if "DIQ010" in df.columns:
                df = df[["SEQN", "DIQ010"]]
            else:
                return None

        os.remove(xpt_path)
        return df

    except Exception as e:
        print(f"ERROR reading file: {e}")
        return None


def apply_filters(df, filters):

    if df.empty:
        return df

    if "gender" in filters and filters["gender"]:
        gender_map = {"Male": 1, "Female": 2}
        gender_codes = [gender_map[g] for g in filters["gender"]] if isinstance(filters["gender"], list) else [gender_map[filters["gender"]]]
        df = df[df["RIAGENDR"].isin(gender_codes)]

    if "race" in filters and filters["race"]:
        race_map = {
            "Mexican American": 1,
            "Other Hispanic": 2,
            "Non-Hispanic White": 3,
            "Non-Hispanic Black": 4,
            "Other": 5
        }
        race_codes = [race_map[r] for r in filters["race"]] if isinstance(filters["race"], list) else [race_map[filters["race"]]]
        df = df[df["RIDRETH1"].isin(race_codes)]

    if "age" in filters and filters["age"]:
        age_range = filters["age"]
        df["RIDAGEYR"] = pd.to_numeric(df["RIDAGEYR"], errors="coerce")

        if "-" in age_range:
            lower, upper = map(int, age_range.split("-"))
            df = df[(df["RIDAGEYR"] >= lower) & (df["RIDAGEYR"] <= upper)]
        elif age_range == "60+":
            df = df[df["RIDAGEYR"] >= 60]

    return df


class PatientProfileBuilder:
    def __init__(self, download_function):
        self.download_function = download_function

    def build_profile(self, selections, cycles):
        demo_dfs = []
        questionnaire_dfs = []

        # Get demographics
        for cycle in cycles:
            if "demographics" in selections:
                df = self.download_function(cycle, selections["demographics"]["file"], "demographics")
                if df is not None:
                    demo_dfs.append(df)

        if not demo_dfs:
            return None

        merged_demo_df = pd.concat(demo_dfs, ignore_index=True)
        filters = selections["demographics"].get("filters", {})
        merged_demo_df = apply_filters(merged_demo_df, filters)

        # Get questionnaire (diabetes)
        for cycle in cycles:
            if "questionnaire" in selections:
                df = self.download_function(cycle, selections["questionnaire"]["file"], "questionnaire")
                if df is not None:
                    questionnaire_dfs.append(df)

        merged_questionnaire_df = pd.concat(questionnaire_dfs, ignore_index=True) if questionnaire_dfs else None

        if merged_questionnaire_df is not None:
            final_profile = pd.merge(merged_demo_df, merged_questionnaire_df, on="SEQN", how="inner")
        else:
            final_profile = merged_demo_df

        # ----------------------------
        # Convert codes to readable
        # ----------------------------

        # Gender
        final_profile["RIAGENDR"] = final_profile["RIAGENDR"].map({
            1: "Male",
            2: "Female"
        })

        # Ethnicity
        final_profile["RIDRETH1"] = final_profile["RIDRETH1"].map({
            1: "Mexican American",
            2: "Other Hispanic",
            3: "Non-Hispanic White",
            4: "Non-Hispanic Black",
            5: "Other"
        })

        # Diabetes (DIQ010)
        if "DIQ010" in final_profile.columns:
            final_profile["DIQ010"] = final_profile["DIQ010"].map({
                1: "Yes",
                2: "No"
            })
            #final_profile.rename(columns={"DIQ010": "Diabetes"}, inplace=True) #<--

        # Rename columns
        final_profile.rename(columns={
            "SEQN": "ID",
            #"RIDAGEYR": "Age",   #<-- 
            "RIAGENDR": "Gender",
            "RIDRETH1": "Ethnicity"
        }, inplace=True)

        os.makedirs("nhanes_data", exist_ok=True)
        final_profile.to_csv("nhanes_data/merged_profile.csv", index=False)

        return final_profile