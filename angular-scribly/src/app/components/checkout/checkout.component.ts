import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { error } from 'console';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { PaymentInfo } from 'src/app/common/payment-info';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ScriblyFormService } from 'src/app/services/scribly-form.service';
import { ScriblyValidators } from 'src/app/validators/scribly-validators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardMonths: number[] = [];
  creditCardYears: number[] = [];

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage: Storage = sessionStorage;


  // Stripe API initialization
  stripe = Stripe(environment.stripePublishableKey);

  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = "";

  // disbale purchase button after purchase
  isDisabled: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private scriblyFormService: ScriblyFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit(): void {

    // setup Stripe payment form
    this.setupStripePaymentForm();

    this.reviewCartDetails();

    // read the user's email address from browser storage
    const theEmail = JSON.parse(this.storage.getItem('userEmail')!);

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(1),
          ScriblyValidators.notOnlyWhitespace,
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(1),
          ScriblyValidators.notOnlyWhitespace,
        ]),
        email: new FormControl(theEmail, [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ]),
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ScriblyValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ScriblyValidators.notOnlyWhitespace,
        ]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ScriblyValidators.notOnlyWhitespace,
        ]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ScriblyValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ScriblyValidators.notOnlyWhitespace,
        ]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ScriblyValidators.notOnlyWhitespace,
        ]),
      }),

      creditCard: this.formBuilder.group({
        /*
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ScriblyValidators.notOnlyWhitespace,
        ]),
        cardNumber: new FormControl('', [
          Validators.required,
          Validators.pattern('[0-9]{16}'),
        ]),
        securityCode: new FormControl('', [
          Validators.required,
          Validators.pattern('[0-9]{3}'),
        ]),
        expirationMonth: [''],
        expirationYear: [''],*/
      }),


    });

    // // populate credit card months
    // this.scriblyFormService
    //   .getCreditCardMonths(new Date().getMonth() + 1)
    //   .subscribe((data) => {
    //     console.log('Retrieved credit card years: ' + JSON.stringify(data));
    //     this.creditCardMonths = data;
    //   });

    // // populate credit card years
    // this.scriblyFormService.getCreditCardYears().subscribe((data) => {
    //   console.log('Retrieved credit card years: ' + JSON.stringify(data));
    //   this.creditCardYears = data;
    // });

    // populate countries
    this.scriblyFormService.getCountries().subscribe((data) => {
      this.countries = data;
    });
  }

  setupStripePaymentForm(){

    // get a handle to stripe elements
    var elements = this.stripe.elements();

    // Create a card element ... and hide the zip-code feild
    this.cardElement = elements.create('card', {hidePostalCode:true});
    
    // Add an instance of card UI component into the 'card-element' div
    this.cardElement.mount('#card-element');

    // Add event binding for the 'change' event on card element
    this.cardElement.on('change', (event: any)=>{
      // get handle to card-error element
      this.displayError = document.getElementById('card-errors');

      if(event.complete){
        this.displayError.textContent = "";
      }else if(event.error){
        // show validation error to the customer
        this.displayError.textContent = event.error.message;
      }
    });
  }

  reviewCartDetails() {
    this.cartService.totalPrice.subscribe((data) => (this.totalPrice = data));

    this.cartService.totalQuantity.subscribe(
      (data) => (this.totalQuantity = data)
    );
  }

  // getters
  get firstName() {
    return this.checkoutFormGroup.get('customer.firstName');
  }
  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName');
  }
  get email() {
    return this.checkoutFormGroup.get('customer.email');
  }

  get shippingAddressStreet() {
    return this.checkoutFormGroup.get('shippingAddress.street');
  }
  get shippingAddressCity() {
    return this.checkoutFormGroup.get('shippingAddress.city');
  }
  get shippingAddressState() {
    return this.checkoutFormGroup.get('shippingAddress.state');
  }
  get shippingAddressCountry() {
    return this.checkoutFormGroup.get('shippingAddress.country');
  }
  get shippingAddressZipcode() {
    return this.checkoutFormGroup.get('shippingAddress.zipCode');
  }

  get billingAddressStreet() {
    return this.checkoutFormGroup.get('billingAddress.street');
  }
  get billingAddressCity() {
    return this.checkoutFormGroup.get('billingAddress.city');
  }
  get billingAddressState() {
    return this.checkoutFormGroup.get('billingAddress.state');
  }
  get billingAddressCountry() {
    return this.checkoutFormGroup.get('billingAddress.country');
  }
  get billingAddressZipcode() {
    return this.checkoutFormGroup.get('billingAddress.zipCode');
  }

  get creditCardCardType() {
    return this.checkoutFormGroup.get('creditCard.cardType');
  }

  get creditCardNameOnCard() {
    return this.checkoutFormGroup.get('creditCard.nameOnCard');
  }
  get creditCardCardNumber() {
    return this.checkoutFormGroup.get('creditCard.cardNumber');
  }
  get creditCardSecurityCode() {
    return this.checkoutFormGroup.get('creditCard.securityCode');
  }

  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(
        this.checkoutFormGroup.controls['shippingAddress'].value
      );

      // bug fix for state
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      // bug fix for state
      this.billingAddressStates = [];
    }
  }
  onSubmit() {
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems

    /*let orderItems: OrderItem[] = [];
    for (let i = 0; i < cartItems.length; i++) {
      orderItems[i] = new OrderItem(cartItems[i]);
    }*/

    let orderItems: OrderItem[] = cartItems.map(
      (tempCartItem) => new OrderItem(tempCartItem)
    );

    // set up purchase
    let purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // populate purchase - shippingAddress
    purchase.shippingAddress =
      this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(
      JSON.stringify(purchase.shippingAddress.state)
    );
    const shippingCountry: Country = JSON.parse(
      JSON.stringify(purchase.shippingAddress.country)
    );
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // populate purchase - billingAddress
    purchase.billingAddress =
      this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(
      JSON.stringify(purchase.billingAddress.state)
    );
    const billingCountry: Country = JSON.parse(
      JSON.stringify(purchase.billingAddress.country)
    );
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // compute payment info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "USD";
    this.paymentInfo.receiptEmail = purchase.customer.email;
    
    /* // call the REST API via the checkoutService
    this.checkoutService.placeOrder(purchase).subscribe({
      next: (response) => {
        alert(
          `Your order has been recieved.\nOrder tracking number: ${response.orderTrackingNumber}`
        );

        // reset cart
        this.resetCart();
      },
      error: (err) => {
        alert(`There was an error: ${err.message}`);
      },
    });*/

    // API calling after implementing Stripe

    // If valid form then
    // - create payment intent
    // - confirm card payment
    // - place other 

    if(!this.checkoutFormGroup.invalid && this.displayError.textContent===""){

      this.isDisabled = true;

      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (payemntIntentResponse) => {
          this.stripe.confirmCardPayment(payemntIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement,
                billing_details: {
                  email: purchase.customer.email,
                  name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                  address: {
                    line1: purchase.billingAddress.street,
                    city: purchase.billingAddress.city,
                    state: purchase.billingAddress.state,
                    postal_code: purchase.billingAddress.zipCode,
                    country: this.billingAddressCountry?.value.code
                  }
                }
              }
            }, {handleActions: false})
            .then((result: any) => {
              if(result.error){
                // inform the customer there was an error
                alert(`There was an error: ${result.error.message}`);

                this.isDisabled = false;

              }else{
                // call the REST API via the CheckoutService
                this.checkoutService.placeOrder(purchase).subscribe({
                  next: (response: any) => {
                    alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);

                    // reset cart
                    this.resetCart();

                    this.isDisabled = false;
  
                  },
                  error: (err:any) => {
                    alert(`There was an error: ${err.message}`);
                
                    this.isDisabled = false;
                  }
                })
              }
            });
        }
      );
    } else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
  }

  resetCart(){
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();

    // reset the form
    this.checkoutFormGroup.reset();

    // navigate back to products page
    this.router.navigateByUrl("/products");
  }

  // handleMonthsAndYears() {
  //   const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

  //   const currentYear: number = new Date().getFullYear();
  //   const selectedYear: number = Number(
  //     creditCardFormGroup!.value.expirationYear
  //   );

  //   // if the current year equals the selected year, start with the current month
  //   let startMonth: number;

  //   if (currentYear === selectedYear) {
  //     startMonth = new Date().getMonth() + 1;
  //   } else {
  //     startMonth = 1;
  //   }

  //   this.scriblyFormService
  //     .getCreditCardMonths(startMonth)
  //     .subscribe((data) => {
  //       console.log('Retrieved credit card years: ' + JSON.stringify(data));
  //       this.creditCardMonths = data;
  //     });
  // }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup!.value.country.code;

    // populate states
    this.scriblyFormService.getStates(countryCode).subscribe((data) => {
      if (formGroupName === 'shippingAddress') {
        this.shippingAddressStates = data;
      } else {
        this.billingAddressStates = data;
      }

      // select the first item by default
      formGroup?.get('state')?.setValue(data[0]);
    });
  }
}
