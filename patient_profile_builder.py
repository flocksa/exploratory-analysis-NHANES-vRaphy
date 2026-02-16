import os
import requests
import pandas as pd

def download_nhanes_file(cycle, file_desc, category, download_dir="nhanes_data"):
    print(f"DEBUG: Requested -> Cycle: {cycle}, Description: {file_desc}, Category: {category}")

    category = category.lower()

    # maps a 2-year cycle to the first year of the cycle.
    cycle_mapping = {
        "1999-2000": "1999",   #first part is what you actually see and want in your frontend, second part is what's the name of the file 
        "2001-2002": "2001", 
        "2003-2004": "2003",
        "2005-2006": "2005", 
        "2007-2008": "2007", 
        "2009-2010": "2009",
        "2011-2012": "2011", 
        "2013-2014": "2013", 
        "2015-2016": "2015", 
        #"2017-2018": "2017",            removed this because 2017-2020 includes this
        "2017-2020": "2017",
        "2021-2023": "2021"
    }
    cycle_single_year = cycle_mapping.get(cycle, None)
    if not cycle_single_year:
        print(f"ERROR: Cycle '{cycle}' not recognized in cycle_mapping!")
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
                "2017": "P_DEMO", #for some reason they changed the naming convention be very careful!
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
                "2017": "P_DIQ", # =w= we just randomly skip letters and it's backwards
                "2021": "DIQ_L"
            }
        },
        # "laboratory":{
        #     "Cholesterol - Total":{
        #         "1999": "LAB13", 
        #         "2001": "L13_B", 
        #         "2003": "L13_C", 
        #         "2005": "TCHOL_D",
        #         "2007": "TCHOL_E", 
        #         "2009": "TCHOL_F", 
        #         "2011": "TCHOL_G", 
        #         "2013": "TCHOL_H",
        #         "2015": "TCHOL_I", 
        #         "2017": "P_TCHOL", 
        #         "2021": "TCHOL_L"
        #     }
        # }
    }

    file_name = nhanes_file_mapping.get(category, {}).get(file_desc, {}).get(cycle_single_year, None)
    if not file_name:
        print(f"ERROR: No file mapping found for category '{category}', description '{file_desc}', cycle '{cycle_single_year}'")
        return None

    url = f"https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/{cycle_single_year}/DataFiles/{file_name}.XPT"
    print(f"DEBUG: Constructed URL -> {url}")

    os.makedirs(download_dir, exist_ok=True)
    xpt_path = os.path.join(download_dir, f"{file_name}.XPT")

    if not os.path.exists(xpt_path):
        print(f"DEBUG: Downloading file from {url}...")
        response = requests.get(url)
        if response.status_code != 200:
            print(f"ERROR: Failed to download {file_name}.XPT, Status Code: {response.status_code}")
            return None
        with open(xpt_path, "wb") as f:
            f.write(response.content)

    try:
        df = pd.read_sas(xpt_path, format='xport')
        print(f"DEBUG: Successfully loaded {file_name}, Shape: {df.shape}")

        if category == "demographics" and file_desc == "Demographic Variables & Sample Weights":
            required_columns = ["SEQN", "RIDAGEYR", "RIAGENDR", "RIDRETH1"]
            df = df[required_columns]

        if category == "questionnaire" and file_desc == "Diabetes":
            if "DIQ010" in df.columns:
                df = df[["SEQN", "DIQ010"]]
                df.rename(columns={"DIQ010": f"DIQ010_{cycle}"}, inplace=True)
            else:
                print(f"WARNING: 'DIQ010' not found in {file_name}, skipping.")
                return None

        os.remove(xpt_path)
        print(f"DEBUG: Deleted {file_name}.XPT after processing")

        return df
    except Exception as e:
        print(f"ERROR: Failed to read {file_name}: {str(e)}")
        return None


def apply_filters(df, filters):
    """
    Apply filters to the demographic DataFrame.

    Filters:
    - RIAGENDR: Gender (1 = Male, 2 = Female)
    - RIDRETH1: Race/Ethnicity (1 = Mexican American, etc.)
    - RIDAGEYR: Age range (e.g., 20-29)
    """
    print(f"DEBUG: Applying filters -> {filters}")

    if isinstance(df, str):
        print("ERROR: Received a string instead of a DataFrame!")
        return None

    if df.empty:
        print("DEBUG: DataFrame is empty before applying filters.")
        return df

    if "gender" in filters and "RIAGENDR" in df.columns and filters["gender"]:
        print("DEBUG: Applying gender filter")
        df["RIAGENDR"] = pd.to_numeric(df["RIAGENDR"], errors="coerce")
        gender_map = {"Male": 1, "Female": 2}
        gender_codes = [gender_map[g] for g in filters["gender"]] if isinstance(filters["gender"], list) else [gender_map[filters["gender"]]]
        df = df[df["RIAGENDR"].isin(gender_codes)]

    if "race" in filters and "RIDRETH1" in df.columns and filters["race"]:
        print("DEBUG: Applying race filter")
        race_map = {
            "Mexican American": 1,
            "Other Hispanic": 2,
            "Non-Hispanic White": 3,
            "Non-Hispanic Black": 4,
            "Other": 5
        }
        race_codes = [race_map[r] for r in filters["race"]] if isinstance(filters["race"], list) else [race_map[filters["race"]]]
        df = df[df["RIDRETH1"].isin(race_codes)]

    if "age" in filters and "RIDAGEYR" in df.columns and filters["age"]:
        print("DEBUG: Applying age filter")
        age_range = filters["age"]
        df["RIDAGEYR"] = pd.to_numeric(df["RIDAGEYR"], errors="coerce")

        if age_range == "10-15":
            df = df[(df["RIDAGEYR"] >= 10) & (df["RIDAGEYR"] <= 15)]
        elif age_range == "15-19":
            df = df[(df["RIDAGEYR"] >= 15) & (df["RIDAGEYR"] <= 19)]
        elif "-" in age_range:
            bounds = age_range.split("-")
            if len(bounds) == 2:
                lower, upper = int(bounds[0]), int(bounds[1])
                df = df[(df["RIDAGEYR"] >= lower) & (df["RIDAGEYR"] <= upper)]
        elif age_range == "60+":
            df = df[df["RIDAGEYR"] >= 60]
        else:
            print(f"WARNING: Unrecognized age range '{age_range}'")

    print(f"DEBUG: DataFrame shape after filtering: {df.shape}")
    return df


class PatientProfileBuilder:
    def __init__(self, download_function):
        self.download_function = download_function

    def build_profile(self, selections, cycles):
        print(f"DEBUG: build_profile called with selections={selections}, cycles={cycles}")

        demo_dfs = []
        questionnaire_dfs = []

        for cycle in cycles:
            if "demographics" in selections:
                file_desc = selections["demographics"]["file"]
                print(f"  Retrieving demographics '{file_desc}' for cycle {cycle}...")
                df = self.download_function(cycle, file_desc, "demographics")

                if df is not None:
                    demo_dfs.append(df)
                else:
                    print(f"  WARNING: No demographic data for cycle {cycle}.")

        if demo_dfs:
            print("DEBUG: Merging all demographic datasets before filtering...")
            merged_demo_df = pd.concat(demo_dfs, ignore_index=True)

            filters = selections["demographics"].get("filters", {})
            merged_demo_df = apply_filters(merged_demo_df, filters)
        else:
            print("ERROR: No demographic data available after merging!")
            return None

        for cycle in cycles:
            if "questionnaire" in selections:
                file_desc = selections["questionnaire"]["file"]
                print(f"  Retrieving questionnaire '{file_desc}' for cycle {cycle}...")
                df = self.download_function(cycle, file_desc, "questionnaire")

                if df is not None:
                    questionnaire_dfs.append(df)
                else:
                    print(f"  WARNING: No questionnaire data for cycle {cycle}.")

        if questionnaire_dfs:
            print("DEBUG: Merging all questionnaire datasets...")
            merged_questionnaire_df = pd.concat(questionnaire_dfs, ignore_index=True)
        else:
            print("WARNING: No questionnaire data found.")
            merged_questionnaire_df = None

        if merged_questionnaire_df is not None:
            print("DEBUG: Merging filtered demographics with questionnaire data...")
            final_profile = pd.merge(merged_demo_df, merged_questionnaire_df, on="SEQN", how="inner")
        else:
            print("DEBUG: No questionnaire data found. Using only demographics.")
            final_profile = merged_demo_df

        merged_csv_path = "nhanes_data/merged_profile.csv"
        final_profile.to_csv(merged_csv_path, index=False)
        print(f"DEBUG: Merged CSV saved at {merged_csv_path}")

        return final_profile
