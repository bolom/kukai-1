import { AfterViewChecked, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Account } from '../../../../../services/wallet/wallet';
import { CONSTANTS } from '../../../../../../environments/environment';
import { TokenBalancesService } from '../../../../../services/token-balances/token-balances.service';
import { SubjectService } from '../../../../../services/subject/subject.service';
import { WalletService } from '../../../../../services/wallet/wallet.service';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { Big } from 'big.js';
import { RemoveCommaPipe } from '../../../../../pipes/remove-comma.pipe';
import { ModalComponent } from '../../../../../components/modals/modal.component';
import { MessageService } from '../../../../../services/message/message.service';

@Component({
  selector: 'app-balances',
  templateUrl: './balances.component.html',
  styleUrls: ['../../../../../../scss/components/views/logged-in/account-view/cards/balances/balances.component.scss']
})
export class BalancesComponent implements OnInit, AfterViewChecked, OnDestroy {
  Object = Object;
  @Input() account: Account;
  contractAliases = CONSTANTS.CONTRACT_ALIASES;
  totalBalances: string | number = 0;
  balances: any[];
  isFiat = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    public tokenBalancesService: TokenBalancesService,
    private subjectService: SubjectService,
    private walletService: WalletService,
    public removeCommaPipe: RemoveCommaPipe,
    private messageService: MessageService
  ) {
    this.subscriptions.add(
      this.subjectService.activeAccount.pipe(filter((account: Account) => account?.address !== this.account?.address)).subscribe((account) => {
        this.account = account;
        this.balances = this.tokenBalancesService?.balances;
        this.calcTotalBalances();
      })
    );
    this.subscriptions.add(
      this.subjectService.nftsUpdated.subscribe((p) => {
        this.balances = p?.balances ?? this.tokenBalancesService?.balances;
        this.calcTotalBalances();
      })
    );
    this.subscriptions.add(
      this.subjectService.walletUpdated.subscribe(() => {
        this.balances = this.tokenBalancesService?.balances;
        this.calcTotalBalances();
      })
    );
  }
  e(wrap) {
    if (!!wrap) {
      if (wrap.scrollTop < 1 || this.tokenBalancesService?.balances?.length <= 5) {
        document.querySelector('.scroll-wrapper .tez').classList.add('no-box');
        document.querySelector('.total-balances').classList.add('no-box');
      } else {
        document.querySelector('.scroll-wrapper .tez').classList.remove('no-box');
        document.querySelector('.total-balances').classList.remove('no-box');
      }

      if (this.tokenBalancesService?.balances?.length > 4) {
        wrap.style.overflowY = 'auto';
        wrap.style.width = 'calc(100% - 2.675rem)';
        wrap.style.padding = '0 0 0 2rem';
      } else {
        wrap.style.overflowY = '';
        wrap.style.width = '';
        wrap.style.padding = '';
      }
    }
  }
  ngOnInit(): void {
    this.balances = this.tokenBalancesService?.balances;
    this.calcTotalBalances();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  ngAfterViewChecked(): void {
    const wrap = document.querySelector('.scroll-wrapper .balances') as HTMLElement;
    this.e(wrap);
  }
  trackToken(index: number, token: any) {
    return token?.contractAddress ? token.contractAddress + ':' + token?.id + ':' + token?.balance + ':' + token?.thumbnailAsset : index;
  }

  toggleTotalBalances(): void {
    this.isFiat = !this.isFiat;
    this.calcTotalBalances();
  }
  calcTotalBalances(): void {
    this.totalBalances = this.isFiat
      ? this.balances.reduce((prev, balance) => prev + parseFloat(balance?.price ?? 0), 0) + this.account?.balanceUSD
      : this.balances.reduce((prev, balance) => prev + parseFloat(balance?.price ?? 0), 0) / this.walletService.wallet.XTZrate +
        parseFloat(
          Big(this.account?.balanceXTZ ?? 0)
            .div(1000000)
            .toFixed()
        );
  }
}
