#import jsons

import simplejson as json
import csv

worldjson = '{}'
c = 0
d = 0
worldpercap = {}
worldgross = {}

with open('worldgrossco2.csv', 'rb') as csvfile:
    worldgrossreader = csv.reader(csvfile, delimiter=',', quotechar='|')
    for row in worldgrossreader:    	
     	if c != 0:
     	# 	print c
    		# print row
    		worldgross[c-1] = row
     	c+=1

with open('worldpercap.csv', 'rb') as csvfile:
    spamreader = csv.reader(csvfile, delimiter=',', quotechar='|')
    for row in spamreader:
    	if d != 0:
    		# print d
    		# print row
    		worldpercap[d-1] = row	     	
     	d+=1

print worldgross
print worldpercap

# [1][0] = country numerical id (exclude)
# [1][1] = country name
# [1][2] = country code ISO 3 char
# [1][3] = year 2000
# [1][4] = year 2013
# [1][5] = percentage
# [1][6] = type

crnt_master = json.loads(worldjson)
crnt_master["countries"] = {}
crnt_countries = crnt_master["countries"]

lencap = len(worldpercap)

for x in range(0, (lencap)):
	print x
	print worldpercap[x]

	crnt_countries[x] = {}
	crnt_countries[x]['id'] = worldgross[x][2]
	crnt_countries[x]['name'] = worldgross[x][1]
	crnt_countries[x]['type'] = worldgross[x][6]
	crnt_countries[x]['data'] = {}
	data = crnt_countries[x]['data']
	data['gross'] = {}
	data['percap'] = {}
	data['gross']['y00'] = worldgross[x][3] 
	data['gross']['y13'] = worldgross[x][4]
	data['gross']['pctchg'] = worldgross[x][5]
	data['percap']['y00'] = worldpercap[x][3] 
	data['percap']['y13'] = worldpercap[x][4]
	data['percap']['pctchg'] = worldpercap[x][5]
	print "success" + worldpercap[x][1] + str(x)
	# pass

# # Add the Date that the data is from
crnt_master["source"] = 'IEA, 2015 (c) OECD/IEA 2015'
crnt_master["type"] = 'Metric Tonnes CO2'


with open('worldco2.json', 'wb') as f:
    json.dump(crnt_master, f)	