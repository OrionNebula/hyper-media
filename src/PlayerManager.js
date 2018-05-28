import { EventEmitter } from 'events'

export class PlayerManager extends EventEmitter {
  constructor (pluginClasses, config) {
    super()
    this.config = Object.assign({
      default: undefined,
      showArtwork: true,
      autoPause: false,
      autoResume: false,
      shuffleRepeat: true
    }, config || {})
    this.plugins = []
    pluginClasses.forEach(PluginClass => {
      var obj = new PluginClass(this, config)
      if (this.validatePlugin(obj)) {
        this.plugins.push(obj)
      } else {
        console.error(`Media plugin ${PluginClass.name} failed validation. It may be missing some required methods.`)
      }
    })

    console.log(`Loaded ${this.plugins.length} media plugins.`)

    var maybeDefault = this.plugins.find(x => x.playerName() === config.default)
    if (!config.default || !maybeDefault) this.setActivePlugin(this.plugins[0])
    else this.setActivePlugin(maybeDefault)
  }

  setActivePlugin (newPlugin) {
    if (this.currentPlugin) {
      this.currentPlugin.deactivate()
      this.currentPlugin.removeAllListeners()
    }

    this.currentPlugin = newPlugin
    if (newPlugin) {
      newPlugin.activate()
    }

    this.emit('newPlugin', newPlugin)
  }

  validatePlugin (pluginObject) {
    const requiredFunctions = [
      'playerName',
      'iconUrl',
      'activate',
      'deactivate'
    ]

    for (var i = 0; i < requiredFunctions.length; i++) {
      if (!(pluginObject[requiredFunctions[i]] instanceof Function)) {
        return false
      }
    }

    return true
  }
}
