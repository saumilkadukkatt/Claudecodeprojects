import { BasePlugin } from './base-plugin';
import { SapPressPlugin } from './adapters/sap-press.plugin';
import { LinkedInLearningPlugin } from './adapters/linkedin-learning.plugin';

class PluginRegistry {
  private plugins: BasePlugin[] = [new SapPressPlugin(), new LinkedInLearningPlugin()];

  findPlugin(url: string): BasePlugin | null {
    return this.plugins.find((p) => p.matches(url)) || null;
  }

  registerPlugin(plugin: BasePlugin): void {
    this.plugins.push(plugin);
  }

  listPlugins() {
    return this.plugins.map((p) => p.info);
  }
}

export const pluginRegistry = new PluginRegistry();
