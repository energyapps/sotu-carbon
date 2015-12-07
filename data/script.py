#import jsons

import simplejson as json
import csv
# usgrossco2 = open('USgrossco2.csv', 'rb')
# usraw = csv.reader(usgrossco2)

# print usraw

usjson = '{}'
c = 0
d = 0
uspercap = {}
usgross = {}

with open('USgrossco2.csv', 'rb') as csvfile:
    usgrossreader = csv.reader(csvfile, delimiter=',', quotechar='|')
    for row in usgrossreader:
    	c+=1
     	usgross[c] = row

with open('USpercap.csv', 'rb') as csvfile:
    spamreader = csv.reader(csvfile, delimiter=',', quotechar='|')
    for row in spamreader:
    	d+=1
     	uspercap[d] = row

# [1][0] = state
# [1][1] = year 2000
# [1][14] = year 2013
# [1][15] = percentage

crnt_master = json.loads(usjson)
crnt_master["states"] = {}
crnt_states = crnt_master["states"]

# # Encode JSON into python structure
statesraw = open('states_meta.json')
states = json.load(statesraw)

lencap = len(uspercap) + 1

for i in range(0, len(states)):
	# Call in the electricity data for each state
	stateabbrev = states[i]['stateabbrev']
	crnt_states[i] = {}
	crnt_states[i]['id'] = states[i]['stateabbrev']
	crnt_states[i]['value'] = states[i]['state']
	crnt_states[i]['indexy'] = i
	crnt_states[i]['data'] = {}
	data = crnt_states[i]['data']
	data['gross'] = {}
	data['percap'] = {}
	
	# Run through csv, skip first two header rows, start with alabama. 
	for x in range(2, (lencap)):
		# print x
		# print uspercap[x]
		if states[i]['state'] == uspercap[x][0]:
			data['gross']['y00'] = usgross[x][1] 
			data['gross']['y13'] = usgross[x][14]
			data['gross']['pctchg'] = usgross[x][15]
			data['percap']['y00'] = uspercap[x][1] 
			data['percap']['y13'] = uspercap[x][14]
			data['percap']['pctchg'] = uspercap[x][15]
			print "success" + uspercap[x][0] + str(x)
			pass

# # Add the Date that the data is from
crnt_master["source"] = 'EIA Climate Data'
crnt_master["type"] = 'Metric Tonnes CO2'


with open('usaco2test.json', 'wb') as f:
    json.dump(crnt_master, f)	