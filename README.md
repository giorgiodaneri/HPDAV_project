# HPDAV Project
## Pipeline setup
Since the datasets are quite large, especially the one corresponding to the firewall, we need to apply an initial filtering to make them more easily processable. This is done by placing all the datasets in a folder called ```MC2-CSVFirewallandIDSlogs``` in your local environment, then running the following python scripts:
1. ```filter_firewall.py```: This script filters out the most cumbersome files, i.e. the firewall logs, which size are concatenated and transformed according to different mapping rules, applied to categorical attributes. 
2. ```sample_firewall.py```: This script samples the logs corresponding to the `http` and `6667_tcp` services, which amount to more than 90% of the total connections. This is done to make the dataset more manageable for the visualization part. We made sure that the distribution of the data is not significantly altered by the sampling process.
3. ```filter_IDS.py```: This script filters out the IDS logs with an analogous rationale. It is not necessary to apply sampling to this dataset, as it is already quite small.

Please do not try to push the datasets to the repository, as they are too large and git will not allow you anyways. Handle them locally as described above.
After this, we can perform some preliminary data anaysis on the filtered data to draw some early conclusions and identify relevant information concerning suspect activities and those responsible for them. This is done inside the ```data_analysis.ipynb``` notebook.

## Server launch
We set up a python server to handle the data for the visualization part. To do this, run the ```server.py``` script, which will start a server on the localhost at port 5000. The server fetches both datasets as soon as the corresponding event is dispatched by ```App.js``` and sends them to the frontend. For the firewall dataset, pagination is applied, otherwise we risk in crashing the browser. After the first request, the server stores the datasets in the cache, making them available for subsequent requests without the need to read them from the disk again.