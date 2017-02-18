


Choices:
-------

Avoid using `remote.require()` for some packages as calling their functions would introduces a 100ms
delay due synchronous IPC messages. When reactive UI was needed we instead opted to use
`ipcRenderer.send()` as it is asynchronous.