#!/bin/bash
cd ../coronavirus_map_data/
git add .
git commit -m 'upload `${date}`'
git push
echo 'done'
