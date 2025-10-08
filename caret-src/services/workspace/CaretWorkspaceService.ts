import * as vscode from 'vscode';
import { HostProvider } from '@/hosts/host-provider';

export class CaretWorkspaceService {
  private roots: readonly vscode.Uri[] = [];
  private primaryRootIndex: number = 0;

  constructor() {
    // 초기화 로직
  }

  public async initialize(): Promise<void> {
    const response = await HostProvider.workspace.getWorkspacePaths({});
    // TODO: response를 바탕으로 roots와 primaryRootIndex를 설정하는 로직 구현
  }

  public getWorkspaceRoots(): readonly vscode.Uri[] {
    return this.roots;
  }

  public getPrimaryRootIndex(): number {
    return this.primaryRootIndex;
  }
}
