import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Coronavirus } from "./coronavirus";

@Injectable({
  providedIn: 'root'
})
export class CoronavirusService {
  private subject = new Subject<boolean>();
  public isLoginData = false;
  public head : HttpHeaders; 

 // http://localhost:3000/case/GetAll
  private baseUrl = 'http://localhost:3000/case/';
 // private baseUrl = 'https://localhost:44352/api/case';
 private loginUrl = 'http://localhost:3000/users/'
  // private loginUrl = 'https://localhost:44352/api/Authentication';
  private searchUrl = 'https://localhost:44352/api/SearchCaseInfos';


 // constructor(private http: HttpClient) { }

  constructor(private http: HttpClient) {
    this.head = new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8',
        'x-access-token': localStorage.getItem('token')
    });
}

  addToCart(data: boolean) {
    this.subject.next(data);
  }

  getCart(): Observable<any> {
    return this.subject.asObservable();
  }

  getCoronaCaseList() {
    debugger;
    return this.http.get(this.baseUrl + "GetAll");
  }

  isNullorUndfined(value: any) {
    return value === undefined || value === null;
  }

  getCaseById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl + "GetById"}/${id}`);
  }

  createCase(caseData: Coronavirus) {
    caseData.id = 0;
    return this.http.post(this.baseUrl + "Save", caseData);
  }
  searchCase(data,pageIndex,pageRow) {
    const headers = { 'content-type': 'application/json' }
    const body = JSON.stringify(data);  
    let data1 = {
      searchQuery: body,
      pageIndex: pageIndex,
      pageRow: pageRow
    }
    return this.http.post(this.searchUrl, data1, { headers: headers });

    //return this.http.post(this.searchUrl, JSON.stringify(data) );
  }

  updateCase(value: any): Observable<Object> {
    return this.http.put(`${this.baseUrl + "Update"}`, value);
  }

  deleteCase(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl + "Delete"}/${id}`, { responseType: 'text' });
  }

  getToken() {
    return this.http.get(this.loginUrl);
  }

  login(userData) {
    return this.http.post(this.loginUrl + "login", userData);
  }

  searchData(data) {
    return this.http.post(this.baseUrl + "Search", data);
  }


}
