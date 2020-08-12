 ap[i]; i++){
          pEntry = fts5HashEntryMerge(pEntry, ap[i]);
          ap[i] = 0;
        }
        ap[i] = pEntry;
      }
    }
  }

  pList = 0;
  for(i=0; i<nMergeSlot; i++){
    pList = fts5HashEntryMerge(pList, ap[i]);
  }

  pHash->nEntry = 0;
  sqlite3_free(ap);
  *ppSorted = pList;
  return SQLITE_OK;
}

/*
** Query the hash table for a doclist associated with term pTerm/nTerm.
*/
static int sqlite3Fts5HashQuery(
  Fts5Hash *pHash,                /* Hash table to query */
  const char *pTerm, int nTerm,   /* Query term */
  const u8 **ppDoclist,           /* OUT: Pointer to doclist for pTerm */
  int *pnDoclist                  /* OUT: Size of doclist in bytes */
){
  unsigned int iHash = fts5HashKey(pHash->nSlot, (const u8*)pTerm, nTerm);
  char *zKey = 0;
  Fts5HashEntry *p;

  for(p=pHash->aSlot[iHash]; p; p=p->pHashNext){
    zKey = fts5EntryKey(p);
    if( memcmp(zKey, pTerm, nTerm)==0 && zKey[nTerm]==0 ) break;
  }

  if( p ){
    fts5HashAddPoslistSize(pHash, p);
    *ppDoclist = (const u8*)&zKey[nTerm+1];
    *pnDoclist = p->nData - (sizeof(Fts5HashEntry) + nTerm + 1);
  }else{
    *ppDoclist = 0;
    *pnDoclist = 0;
  }

  return SQLITE_OK;
}

static int sqlite3Fts5HashScanInit(
  Fts5Hash *p,                    /* Hash table to query */
  const char *pTerm, int nTerm    /* Query prefix */
){
  return fts5HashEntrySort(p, pTerm, nTerm, &p->pScan);
}

static void sqlite3Fts5HashScanNext(Fts5Hash *p){
  assert( !sqlite3Fts5HashScanEof(p) );
  p->pScan = p->pScan->pScanNext;
}

static int sqlite3Fts5HashScanEof(Fts5Hash *p){
  return (p->pScan==0);
}

static void sqlite3Fts5HashScanEntry(
  Fts5Hash *pHash,
  const char **pzTerm,            /* OUT: term (nul-te