import pickle
import sys
import json
import numpy as np
with open('dist/ML/decision_tree_model.pkl', 'rb') as model_file:
    model = pickle.load(model_file)
user_data_json = sys.argv[1]
user_data = json.loads(user_data_json)
user_data_array = np.array(list(user_data.values())).reshape(1, -1)
result = model.predict(user_data_array)
print(result[0])
