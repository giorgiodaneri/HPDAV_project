# HPDAV Project
## Pipeline setup
Since the datasets are quite huge, we need to apply an initial filtering to make them more easily processable. This is done by placing all the datasets in a folder called ```MC2-CSVFirewallandIDSlogs``` in your local environment, then running the following python scripts:
1. ```filter_firewall.py```: This script filters out the most cumbersome files, i.e. the firewall logs, which size is reduced to a third and are concatenated into a single file.
2. ```filter_IDS.py```: This script filters out the IDS logs with an analogous rationale.
3. ```filter_logs.py```: This script filters out the remaining logs in txt format, keeping only the portion corresponding to potentially malicious traffick in the network.

Please do not try to push the datasets to the repository, as they are too large and git will not allow you anyways. Handle them locally as described above.
After this, we can perform some preliminary data anaysis on the filtered data to draw some early conclusions and identify relevant information concerning suspect activities and those responsible for them. This is done inside the ```data_analysis.ipynb``` notebook.