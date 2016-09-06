# JSON Transform for VSCode

Interactively transform JSON in VSCode.

### Demo

![](https://raw.githubusercontent.com/octref/vscode-jmespath/master/media/json-transform.gif)

### Pattern

The transform pattern is very to learn. A few examples:

Original json:
```
[
    { "name": "ada", "age": 18 },
    { "name": "bob", "age": 19 },
    { "name": "cal", "age": 20 },
    { "name": "don", "age": 21 }
]
```

`[1]`
```
    { "name": "ada", "age": 18 }
```

`[:2]`
```
[
    { "name": "ada", "age": 18 },
    { "name": "bob", "age": 19 }
]
```

`[:2].name`
```
[
    "ada",
    "bob"
]
```

`[:2].{ NickName: name }`
```
[
  { "NickName": "ada" },
  { "NickName": "bob" }
]
```

To learn more about the patterns and try it interactively, go to [JMESPath Tutorial](http://jmespath.org/tutorial.html).

### License

MIT