function createEnvTree(envVariables) {
    var envVarTree = {
        value: null,
        isEnd: false,
        child: {
        }
    };

    for(let envVariable of envVariables) {
        var envVarTreeIterator = envVarTree;
        if(varUtility.isPredefinedVariable(envVariable.name)) {
            continue;
        } 
        var envVariableNameArray = (envVariable.name).split('_');
        
        for(let variableName of envVariableNameArray) {
            if(envVarTreeIterator.child[variableName] === undefined || typeof envVarTreeIterator.child[variableName] === 'function') {
                envVarTreeIterator.child[variableName] = {
                    value: null,
                    isEnd: false,
                    child: {}
                };
            }
            envVarTreeIterator = envVarTreeIterator.child[variableName];
        }
        envVarTreeIterator.isEnd = true;
        envVarTreeIterator.value = envVariable.value;
    }
    
    return envVarTree;
}

function checkEnvTreePath(jsonObjectKey, index, jsonObjectKeyLength, envVarTree) {
    if(index == jsonObjectKeyLength) {
        return envVarTree;
    }
    if(envVarTree.child[ jsonObjectKey[index] ] === undefined || typeof envVarTree.child[ jsonObjectKey[index] ] === 'function') {
        return undefined;
   }
    return checkEnvTreePath(jsonObjectKey, index + 1, jsonObjectKeyLength, envVarTree.child[ jsonObjectKey[index] ]);
}

function substituteJsonVariable(jsonObject, envObject) {
    for(var jsonChild in jsonObject) {
        var jsonChildArray = jsonChild.split('_');
        var resultNode = checkEnvTreePath(jsonChildArray, 0, jsonChildArray.length, envObject);
        if(resultNode != undefined) {
            if(resultNode.isEnd && (jsonObject[jsonChild] == null || typeof jsonObject[jsonChild] !== "object")) {
                console.log('substituting value on key: ' + jsonChild);
                jsonObject[jsonChild] = resultNode.value;
            }
            else {
                substituteJsonVariable(jsonObject[jsonChild], resultNode);
            }
        }
    }
}

function substituteJsonVariableV2(jsonObject, envObject) {
    for(var jsonChild in jsonObject) {
        var jsonChildArray = jsonChild.split('.');
        var resultNode = checkEnvTreePath(jsonChildArray, 0, jsonChildArray.length, envObject);
        if(resultNode != undefined) {
            if(resultNode.isEnd) {
                switch(typeof(jsonObject[jsonChild])) {
                    case 'number':
                    console.log('substituting value on key: ' + jsonChild + ' with (number) value: ' + resultNode.value);
                        jsonObject[jsonChild] = !isNaN(resultNode.value) ? Number(resultNode.value): resultNode.value;
                        break;
                    case 'boolean':
                        console.log('substituting value on key: ' + jsonChild + ' with (boolean) value: ' + resultNode.value);
                        jsonObject[jsonChild] = (
                            resultNode.value == 'true' ? true : (resultNode.value == 'false' ? false : resultNode.value)
                        )
                        break;
                    case 'object':
                    case null:
                        try {
                            console.log('substituting value on key: ' + jsonChild + ' with (object) value: ' + resultNode.value);
                            jsonObject[jsonChild] = JSON.parse(resultNode.value);
                        }
                        catch(exception) {
                            console.log('unable to substitute the value. falling back to string value');
                            jsonObject[jsonChild] = resultNode.value;
                        }
                        break;
                    case 'string':
                        console.log('substituting value on key: ' + jsonChild + ' with (string) value: ' + resultNode.value);
                        jsonObject[jsonChild] = resultNode.value;
                }
            }
            else {
                substituteJsonVariableV2(jsonObject[jsonChild], resultNode);
            }
        }
    }
}
