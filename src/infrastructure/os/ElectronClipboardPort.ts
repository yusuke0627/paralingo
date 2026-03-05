import { ClipboardPort } from "../../application/ports/ClipboardPort";

/**
 * Since this will be used in the Electron main process, we can use require('electron')
 * or depend on a passed in electron module.
 */
export class ElectronClipboardPort implements ClipboardPort {
  constructor(private electronClipboard: any) {}

  async readText(): Promise<string> {
    return this.electronClipboard.readText();
  }

  async writeText(text: string): Promise<void> {
    this.electronClipboard.writeText(text);
  }
}
