import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryID: number = 1;
  searchMode: boolean = false;

  // new properties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;

  previousKeyword: string = "";

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProduct();
    });
  }

  listProduct() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');
    if (this.searchMode) {
      this.handleSearchProduct();
    } else {
      this.handleListProduct();
    }
  }

  handleSearchProduct() {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;

    //if we have a different keyword than the prevoius one
    // then set thePageNumber to 1

    if(this.previousKeyword != theKeyword){
      this.thePageNumber = 1;
    }

    this.previousKeyword = theKeyword;

    console.log(`Keyword=${theKeyword}, thePageNumber=${this.thePageNumber}`);

    // search for products using that keyword
    this.productService.searchProductsPaginate(this.thePageNumber-1, this.thePageSize, theKeyword).subscribe(this.processResult());
  }

  handleListProduct() {
    // check if the "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      // get the "id" param string. convert string to a number using "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    } else {
      // not category id available... default to category id 1
      this.currentCategoryId = 1;
    }

    //
    // Check if we have a different category than previous
    // Angular will reuse a component if it is currently being viewed
    //

    // If we have a different category id than previous
    // then set thePageNumber back to 1

    if(this.previousCategoryID != this.currentCategoryId){
      this.thePageNumber = 1;
    }

    this.previousCategoryID = this.currentCategoryId;

    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);

    // now get the products for the given category id
    this.productService.getProductListPaginate(this.thePageNumber - 1, this.thePageSize, this.currentCategoryId).subscribe(this.processResult());

  }

  updatePageSize(pageSize: string){
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listProduct();
  }

  processResult(){
    return (data: any) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };
  }

  addToCart(theProduct: Product){
    const theCartItem = new CartItem(theProduct);
    this.cartService.addToCart(theCartItem);
  }
}
