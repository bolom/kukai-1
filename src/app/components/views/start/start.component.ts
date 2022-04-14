import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../../services/wallet/wallet.service';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/filter';
import { TorusService } from '../../../services/torus/torus.service';
import { MessageService } from '../../../services/message/message.service';
import { ImportService } from '../../../services/import/import.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['../../../../scss/components/views/start/start.component.scss']
})
export class StartComponent implements OnInit, OnDestroy {
  isMobile = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private walletService: WalletService,
    public translate: TranslateService,
    public torusService: TorusService,
    private importService: ImportService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    this.subscriptions.add(
      this.route.queryParams.subscribe(async (params) => {
        if (params?.devtool === 'watch') {
          const address = prompt('Enter watch address');
          if (address) {
            try {
              await this.importService.watch(address);
              this.messageService.startSpinner();
              this.router.navigate([`/account/${address}`]);
            } finally {
              this.messageService.stopSpinner();
            }
          }
        }
      })
    );
    if (!this.walletService.wallet) {
      this.torusService.initTorus();
    }

    const e = () => {
      this.isMobile = !!parseInt(getComputedStyle(document.documentElement).getPropertyValue('--is-mobile'));
    };
    window.addEventListener('resize', e);
    e();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async torusLogin(verifier: string): Promise<void> {
    await this.messageService.startSpinner('Loading wallet...');
    // const { keyPair, userInfo } = await this.mockLogin();
    const { keyPair, userInfo } = await this.torusService.loginTorus(verifier).catch(async (e) => await this.messageService.stopSpinner());
    console.log('login done');
    if (keyPair) {
      await this.importService
        .importWalletFromPk(keyPair.pk, '', {
          verifier: userInfo.typeOfLogin,
          id: userInfo.verifierId,
          name: userInfo.name
        })
        .then((success: boolean) => {
          if (success) {
            console.log('success');
            this.router.navigate([`/account/`]);
            this.messageService.stopSpinner();
          } else {
            this.messageService.addError('Torus import failed');
            this.messageService.stopSpinner();
          }
        });
    } else {
      await this.messageService.stopSpinner();
    }
  }

  private async mockLogin(): Promise<any> {
    const keyPair = {
      sk: 'spsk1VfCfhixtzGvUSKDre6jwyGbXFm6aoeLGnxeVLCouueZmkgtJF',
      pk: 'sppk7cZsZeBApsFgYEdWuSwj92YCWkJxMmBfkN3FeKRmEB7Lk5pmDrT',
      pkh: 'tz2WKg52VqnYXH52TZbSVjT4hcc8YGVKi7Pd'
    };
    const userInfo = {
      typeOfLogin: 'google',
      verifierId: 'mock.user@gmail.com',
      name: 'Mock User'
    };
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ keyPair, userInfo });
      }, 2000);
    });
  }
}
